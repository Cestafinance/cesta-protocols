// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface IRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts);
}

interface ICurve {
    function exchange_underlying(int128 i, int128 j, uint dx, uint min_dy) external returns (uint);
}

interface IStrategy {
    function invest(uint amount, uint[] calldata amountsOutMin) external;
    function withdraw(uint sharePerc, uint[] calldata amountsOutMin) external;
    function emergencyWithdraw() external;
    function getAllPoolInUSD() external view returns (uint);
}

contract AvaxStableVaultFuji is Initializable, ERC20Upgradeable, OwnableUpgradeable, 
        ReentrancyGuardUpgradeable, PausableUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;

    IERC20Upgradeable constant USDT = IERC20Upgradeable(0xE01A4D7de190f60F86b683661F67f79F134E0582);
    IERC20Upgradeable constant USDC = IERC20Upgradeable(0xA6cFCa9EB181728082D35419B58Ba7eE4c9c8d38);
    IERC20Upgradeable constant DAI = IERC20Upgradeable(0x3bc22AA42FF61fC2D01E87c2Fa4268D0334b1a4c);

    IRouter constant joeRouter = IRouter(0x60aE616a2155Ee3d9A68541Ba4544862310933d4);
    ICurve constant curve = ICurve(0x7f90122BF0700F9E7e1F688fe926940E8839F353); // av3pool
    IStrategy public strategy;
    address public proxy;

    address public treasuryWallet;
    address public communityWallet;
    address public admin;
    address public strategist;

    // Newly added variable after upgrade
    uint public networkFeePerc;

    event Deposit(address caller, uint amtDeposit, address tokenDeposit);
    event Withdraw(address caller, uint amtWithdraw, address tokenWithdraw, uint shareBurned);
    event Invest(uint amount);
    event SetAddresses(
        address oldTreasuryWallet, address newTreasuryWallet,
        address oldCommunityWallet, address newCommunityWallet,
        address oldAdmin, address newAdmin
    );
    
    modifier onlyOwnerOrAdmin {
        require(msg.sender == owner() || msg.sender == address(admin), "Only owner or admin");
        _;
    }

    function initialize(
        string calldata name, string calldata ticker,
        address _treasuryWallet, address _communityWallet, address _admin,
        address _strategy
    ) external initializer {
        __ERC20_init(name, ticker);
        __Ownable_init();

        strategy = IStrategy(_strategy);

        treasuryWallet = _treasuryWallet;
        communityWallet = _communityWallet;
        admin = _admin;

        // USDT.safeApprove(address(joeRouter), type(uint).max);
        // USDT.safeApprove(address(curve), type(uint).max);
        // USDC.safeApprove(address(joeRouter), type(uint).max);
        // USDC.safeApprove(address(curve), type(uint).max);
        // DAI.safeApprove(address(joeRouter), type(uint).max);
        // DAI.safeApprove(address(curve), type(uint).max);
        // USDT.safeApprove(address(strategy), type(uint).max);
    }

    function deposit(uint amount, IERC20Upgradeable token, uint[] calldata amountsOutMin) external nonReentrant whenNotPaused {
        require(msg.sender == tx.origin, "Only EOA");
        require(amount > 0, "Amount must > 0");
        require(token == USDT || token == USDC || token == DAI, "Invalid token deposit");

        uint pool = getAllPoolInUSD();
        token.safeTransferFrom(msg.sender, address(this), amount);

        uint fees = amount * networkFeePerc / 10000;
        token.safeTransfer(address(treasuryWallet), fees);
        amount -= fees;
        
        // uint USDTAmt;
        // if (token != USDT) {
        //     uint amountOut = token == DAI ? amount / 1e12 : amount;
        //     USDTAmt = curve.exchange_underlying(
        //         getCurveId(address(token)), getCurveId(address(USDT)), amount, amountOut * 99 / 100
        //     );
        // } else {
        //     USDTAmt = amount;
        // }
        // strategy.invest(USDTAmt, amountsOutMin);
        amountsOutMin;
        
        uint _totalSupply = totalSupply();
        // uint depositAmtAfterSlippage = _totalSupply == 0 ? getAllPoolInUSD() : getAllPoolInUSD() - pool;
        // uint share = _totalSupply == 0 ? depositAmtAfterSlippage : depositAmtAfterSlippage * _totalSupply / pool;
        if (token != DAI) amount *= 1e12;
        uint share = _totalSupply == 0 ? amount : amount * _totalSupply / pool;
        _mint(msg.sender, share);

        emit Deposit(msg.sender, amount, address(token));
    }

    function withdraw(uint share, IERC20Upgradeable token, uint[] calldata amountsOutMin) external nonReentrant {
        require(msg.sender == tx.origin, "Only EOA");
        require(share > 0 || share <= balanceOf(msg.sender), "Invalid share amount");
        require(token == USDT || token == USDC || token == DAI, "Invalid token withdraw");

        uint withdrawAmt = (getAllPoolInUSD()) * share / totalSupply();
        _burn(msg.sender, share);

        if (!paused()) {
            // strategy.withdraw(withdrawAmt, amountsOutMin);
            // withdrawAmt = USDT.balanceOf(address(this));
            if (token != DAI) withdrawAmt = share / 1e12;
            else withdrawAmt = share;
        }
        
        // if (token != USDT) {
        //     withdrawAmt = curve.exchange_underlying(
        //         getCurveId(address(USDT)), getCurveId(address(token)), withdrawAmt, withdrawAmt * 99 / 100
        //     );
        // }
        if (token != DAI) withdrawAmt = share / 1e12;
        else withdrawAmt = share;

        uint fees = withdrawAmt * 1 / 100; // 1%
        token.safeTransfer(address(treasuryWallet), fees);
        withdrawAmt -= fees;
        token.safeTransfer(msg.sender, withdrawAmt);

        amountsOutMin;
        emit Withdraw(msg.sender, withdrawAmt, address(token), share);
    }

    function emergencyWithdraw() external onlyOwnerOrAdmin whenNotPaused {
        _pause();

        strategy.emergencyWithdraw();
    }

    function setAddresses(address _treasuryWallet, address _communityWallet, address _admin) external onlyOwner {
        address oldTreasuryWallet = treasuryWallet;
        address oldCommunityWallet = communityWallet;
        address oldAdmin = admin;

        treasuryWallet = _treasuryWallet;
        communityWallet = _communityWallet;
        admin = _admin;

        emit SetAddresses(oldTreasuryWallet, _treasuryWallet, oldCommunityWallet, _communityWallet, oldAdmin, _admin);
    }

    function setFees(uint _feePerc) external onlyOwner {
        networkFeePerc = _feePerc;
    }

    function setProxy(address _proxy) external onlyOwner {
        proxy = _proxy;
    }

    function getCurveId(address token) private pure returns (int128) {
        if (token == address(USDT)) return 2;
        else if (token == address(USDC)) return 1;
        else return 0; // DAI
    }

    function getAllPoolInUSD() public view returns (uint) {
        // if (paused()) return USDT.balanceOf(address(this));
        // return strategy.getAllPoolInUSD();
        return USDT.balanceOf(address(this)) * 1e12 + USDC.balanceOf(address(this)) * 1e12 + DAI.balanceOf(address(this));
    }

    /// @notice Can be use for calculate both user shares & APR    
    function getPricePerFullShare() external view returns (uint) {
        return (getAllPoolInUSD()) * 1e18 / totalSupply();
    }
}