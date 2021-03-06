const { ethers } = require("hardhat")

const JOEUSDTVaultAddr = "0xaC8Ce7535d8E3D911A9aFD9d9260f0eC8722B053"
const PNGUSDCVaultAddr = "0xD57AEEa053b94d4f2DE266b92FA794D73aDb0789"
const LYDDAIVaultAddr = "0x469b5620675a9988c24cDd57B1E7136E162D6a53"

const treasuryAddr = "0x3f68A3c1023d736D8Be867CA49Cb18c543373B99"
const communityAddr = "0x3f68A3c1023d736D8Be867CA49Cb18c543373B99"
const adminAddr = "0x3f68A3c1023d736D8Be867CA49Cb18c543373B99"

const proxyAdminAddr = "0xd02C2Ff6ef80f1d096Bc060454054B607d26763E"
const avaxStableVaultImplAddr = "0x254Ba654D6aEBC334693D5e72776c6cCd548FcB1"

const main = async () => {
    const [deployer] = await ethers.getSigners()

    // const deployerAddr = "0x3f68A3c1023d736D8Be867CA49Cb18c543373B99"
    // await network.provider.request({method: "hardhat_impersonateAccount", params: [deployerAddr]})
    // const deployer = await ethers.getSigner(deployerAddr)

    // Deploy DeXToken-Stablecon strategy
    // const DeXStableStrategyFac = await ethers.getContractFactory("DeXStableStrategy", deployer)
    // // const DeXStableStrategyFac = await ethers.getContractFactory("DeXStableStrategyFuji", deployer)
    // const deXStableStrategyImpl = await DeXStableStrategyFac.deploy()
    // await deXStableStrategyImpl.deployTransaction.wait()
    // console.log("Cesta Avalanche DeXToken-Stablecoin strategy (implementation) contract address:", deXStableStrategyImpl.address)
    const deXStableStrategyImplAddr = "0xd310f4c438f61aC246090F6604F0EDB8520A2965"

    const deXStableStrategyArtifact = await artifacts.readArtifact("DeXStableStrategy")
    // const deXStableStrategyArtifact = await artifacts.readArtifact("DeXStableStrategyFuji")
    const deXStableStrategyInterface = new ethers.utils.Interface(deXStableStrategyArtifact.abi)
    const dataDeXStableStrategy = deXStableStrategyInterface.encodeFunctionData(
        "initialize",
        [JOEUSDTVaultAddr, PNGUSDCVaultAddr, LYDDAIVaultAddr]
    )
    const DeXStableStrategyProxy = await ethers.getContractFactory("AvaxProxy", deployer)
    const deXStableStrategyProxy = await DeXStableStrategyProxy.deploy(
        // deXStableStrategyImpl.address, proxyAdminAddr, dataDeXStableStrategy,
        deXStableStrategyImplAddr, proxyAdminAddr, dataDeXStableStrategy,
    )
    await deXStableStrategyProxy.deployTransaction.wait()
    console.log("Cesta Avalanche DeXToken-Stablecoin strategy (proxy) contract address:", deXStableStrategyProxy.address)
    const deXStableStrategy = await ethers.getContractAt("DeXStableStrategy", deXStableStrategyProxy.address, deployer)

    // Deploy DeXToken-Stablecoin vault
    const avaxStableVaultArtifact = await artifacts.readArtifact("AvaxStableVault")
    // const avaxStableVaultArtifact = await artifacts.readArtifact("AvaxStableVaultFuji")
    const avaxStableVaultInterface = new ethers.utils.Interface(avaxStableVaultArtifact.abi)
    const dataAvaxStableVault = avaxStableVaultInterface.encodeFunctionData(
        "initialize",
        [
            "Cesta L2 Avalanche DeX-Stable", "cestaAXS",
            treasuryAddr, communityAddr, adminAddr, deXStableStrategy.address
        ]
    )
    const AvaxStableVaultProxy = await ethers.getContractFactory("AvaxProxy", deployer)
    const avaxStableVaultProxy = await AvaxStableVaultProxy.deploy(
        avaxStableVaultImplAddr, proxyAdminAddr, dataAvaxStableVault,
    )
    await avaxStableVaultProxy.deployTransaction.wait()
    const avaxStableVault = await ethers.getContractAt("AvaxStableVault", avaxStableVaultProxy.address, deployer)
    // const avaxStableVault = await ethers.getContractAt("AvaxStableVaultFuji", avaxStableVaultProxy.address, deployer)
    console.log("Cesta Avalanche DeXToken-Stablecoin vault (proxy) contract address:", avaxStableVault.address)

    // Set vault
    tx = await deXStableStrategy.setVault(avaxStableVault.address)
    await tx.wait()
    console.log("Set vault successfully")

    // Set whitelist
    const JOEUSDTVault = await ethers.getContractAt("AvaxVaultL1", JOEUSDTVaultAddr, deployer)
    tx = await JOEUSDTVault.setWhitelistAddress(deXStableStrategy.address, true)
    await tx.wait()
    const PNGUSDCVault = await ethers.getContractAt("AvaxVaultL1", PNGUSDCVaultAddr, deployer)
    tx = await PNGUSDCVault.setWhitelistAddress(deXStableStrategy.address, true)
    await tx.wait()
    const LYDDAIVault = await ethers.getContractAt("AvaxVaultL1", LYDDAIVaultAddr, deployer)
    tx = await LYDDAIVault.setWhitelistAddress(deXStableStrategy.address, true)
    await tx.wait()
    console.log("Set whitelist successfully")
}
main()
