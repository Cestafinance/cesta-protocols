const { ethers, artifacts } = require("hardhat")

const JOEAddr = "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd"
const joeRouterAddr = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4"
const joeStakingContractAddr = "0xd6a4F121CA35509aF06A0Be99093d08462f53052"
const joeStakingContractV3Addr = "0x188bED1968b795d5c9022F6a0bb5931Ac4c18F00"

const PNGAddr = "0x60781C2586D68229fde47564546784ab3fACA982"
const pngRouterAddr = "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106"
const pngStakingContractAddr = "0x1f806f7C8dED893fd3caE279191ad7Aa3798E928" // V2 farm (MiniChef)

const LYDAddr = "0x4C9B4E1AC6F24CdE3660D5E4Ef1eBF77C710C084"
const lydRouterAddr = "0xA52aBE4676dbfd04Df42eF7755F01A3c41f28D27"
const lydStakingContractAddr = "0xFb26525B14048B7BB1F3794F6129176195Db7766"

const treasuryAddr = "0x3f68A3c1023d736D8Be867CA49Cb18c543373B99"
const communityAddr = "0x3f68A3c1023d736D8Be867CA49Cb18c543373B99"
const adminAddr = "0x3f68A3c1023d736D8Be867CA49Cb18c543373B99"

const main = async () => {
    const [deployer] = await ethers.getSigners()
    let tx

    // const adminAddr = "0x3f68A3c1023d736D8Be867CA49Cb18c543373B99"
    // await network.provider.request({method: "hardhat_impersonateAccount", params: [adminAddr]})
    // const deployer = await ethers.getSigner(adminAddr)
    // const [me] = await ethers.getSigners()
    // await me.sendTransaction({to: deployer.address, value: ethers.utils.parseEther("999")})

    // Deploy AvaxVaultL1
    // const avaxVaultL1Fac = await ethers.getContractFactory("AvaxVaultL1", deployer)
    // // const avaxVaultL1Fac = await ethers.getContractFactory("AvaxVaultL1Kovan", deployer)
    // const avaxVaultL1 = await avaxVaultL1Fac.deploy()
    // await avaxVaultL1.deployTransaction.wait()
    // console.log("DAO L1 Avalanche vault (implementation) contract address:", avaxVaultL1.address)
    const avaxVaultL1Artifact = await artifacts.readArtifact("AvaxVaultL1")
    // const avaxVaultL1Artifact = await artifacts.readArtifact("AvaxVaultL1Kovan")
    const avaxVaultL1Interface = new ethers.utils.Interface(avaxVaultL1Artifact.abi)

    // const avaxVaultL1FactoryFac = await ethers.getContractFactory("AvaxVaultL1Factory", deployer)
    // const avaxVaultL1Factory = await avaxVaultL1FactoryFac.deploy(avaxVaultL1.address)
    // await avaxVaultL1Factory.deployTransaction.wait()
    // console.log("DAO L1 Avalanche factory contract address:", avaxVaultL1Factory.address)
    const avaxVaultL1Factory = await ethers.getContractAt("AvaxVaultL1Factory", "0x04DDc3281f71DC70879E312BbF759d54f514f07f", deployer)
    
    // Deploy JOE-AVAX
    // const dataJOEAVAX = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Joe JOE-AVAX", "daoJoeJOE",
    //         joeRouterAddr, joeStakingContractV3Addr, JOEAddr, 0, false,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataJOEAVAX)
    // await tx.wait()
    // const JOEAVAXVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 JOE-AVAX vault (proxy) contract address:", JOEAVAXVaultAddr)

    // // Deploy PNG-AVAX
    // const dataPNGAVAX = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Pangolin PNG-AVAX", "daoPngPNG",
    //         pngRouterAddr, "0x574d3245e36Cf8C9dc86430EaDb0fDB2F385F829", PNGAddr, 999, true,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataPNGAVAX)
    // await tx.wait()
    // const PNGAVAXVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 PNG-AVAX vault (proxy) contract address:", PNGAVAXVaultAddr)

    // // Deploy LYD-AVAX
    // const dataLYDAVAX = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Lydia LYD-AVAX", "daolydLYD",
    //         lydRouterAddr, lydStakingContractAddr, LYDAddr, 4, false,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataLYDAVAX)
    // await tx.wait()
    // const LYDAVAXVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 LYD-AVAX vault (proxy) contract address:", LYDAVAXVaultAddr)

    // Deploy JOE-USDT
    const dataJOEUSDT = avaxVaultL1Interface.encodeFunctionData(
        "initialize",
        [
            "DAO L1 Joe JOE-USDT", "daoJoeUSDT",
            joeRouterAddr, joeStakingContractAddr, JOEAddr, 30, false,
            treasuryAddr, communityAddr, adminAddr,
        ]
    )
    tx = await avaxVaultL1Factory.createVault(dataJOEUSDT)
    await tx.wait()
    const JOEUSDTVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    console.log("DAO L1 JOE-USDT vault (proxy) contract address:", JOEUSDTVaultAddr)

    // Deploy PNG-USDC
    const dataPNGUSDC = avaxVaultL1Interface.encodeFunctionData(
        "initialize",
        [
            "DAO L1 Pangolin PNG-USDC", "daoPngUSDC",
            pngRouterAddr, pngStakingContractAddr, PNGAddr, 1, true,
            treasuryAddr, communityAddr, adminAddr,
        ]
    )
    tx = await avaxVaultL1Factory.createVault(dataPNGUSDC)
    await tx.wait()
    const PNGUSDCVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    console.log("DAO L1 PNG-USDC vault (proxy) contract address:", PNGUSDCVaultAddr)

    // // Deploy LYD-DAI
    // const dataLYDDAI = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Lydia LYD-DAI", "daolydDAI",
    //         lydRouterAddr, lydStakingContractAddr, LYDAddr, 26, false,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataLYDDAI)
    // await tx.wait()
    // const LYDDAIVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 LYD-DAI vault (proxy) contract address:", LYDDAIVaultAddr)

    // // Deploy USDT-AVAX
    // const dataUSDTAVAX = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Lydia USDT-AVAX", "daoLydUSDT",
    //         lydRouterAddr, lydStakingContractAddr, LYDAddr, 17, false,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataUSDTAVAX)
    // await tx.wait()
    // const USDTAVAXVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 USDT-AVAX vault (proxy) contract address:", USDTAVAXVaultAddr)

    // Deploy USDC-AVAX
    // const dataUSDCAVAX = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Pangolin USDC-AVAX", "daoPngUSDC",
    //         pngRouterAddr, "0x84b536da1a2d9b0609f9da73139674cc2d75af2d", PNGAddr, 999, true,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataUSDCAVAX)
    // await tx.wait()
    // const USDCAVAXVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 USDC-AVAX vault (proxy) contract address:", USDCAVAXVaultAddr)

    // // Deploy DAI-AVAX
    // const dataDAIAVAX = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Lydia DAI-AVAX", "daoJoeDAI",
    //         joeRouterAddr, joeStakingContractAddr, JOEAddr, 37, false,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataDAIAVAX)
    // await tx.wait()
    // const DAIAVAXVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 DAI-AVAX vault (proxy) contract address:", DAIAVAXVaultAddr)

    // Deploy MIM-AVAX
    // const dataMIMAVAX = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Pangolin MIM-AVAX", "daoPngMIM",
    //         pngRouterAddr, pngStakingContractAddr, PNGAddr, 52, true,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataMIMAVAX)
    // await tx.wait()
    // const MIMAVAXVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 MIM-AVAX vault (proxy) contract address:", MIMAVAXVaultAddr)

    // // Deploy USDT-USDC
    // const dataUSDTUSDC = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Joe USDT-USDC", "daoUSDTUSDC",
    //         joeRouterAddr, joeStakingContractAddr, JOEAddr, 49, false,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataUSDTUSDC)
    // await tx.wait()
    // const USDTUSDCVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 USDT-USDC vault (proxy) contract address:", USDTUSDCVaultAddr)

    // // Deploy USDT-DAI
    // const dataUSDTDAI = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Joe USDT-DAI", "daoUSDTDAI",
    //         joeRouterAddr, joeStakingContractAddr, JOEAddr, 31, false,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataUSDTDAI)
    // await tx.wait()
    // const USDTDAIVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 USDT-DAI vault (proxy) contract address:", USDTDAIVaultAddr)

    // // Deploy USDC-DAI
    // const dataUSDCDAI = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Joe USDC-DAI", "daoUSDCDAI",
    //         joeRouterAddr, joeStakingContractAddr, JOEAddr, 40, false,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataUSDCDAI)
    // await tx.wait()
    // const USDCDAIVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 USDC-DAI vault (proxy) contract address:", USDCDAIVaultAddr)

    // // Deploy USDT-USDC
    // const dataUSDTUSDC = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Png USDT-USDC", "daoUSDTUSDC",
    //         pngRouterAddr, pngStakingContractAddr, PNGAddr, 2, true,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataUSDTUSDC)
    // await tx.wait()
    // const USDTUSDCVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 USDT-USDC vault (proxy) contract address:", USDTUSDCVaultAddr)

    // // Deploy USDT-DAI
    // const dataUSDTDAI = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Lyd USDT-DAI", "daoUSDTDAI",
    //         lydRouterAddr, lydStakingContractAddr, LYDAddr, 22, false,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataUSDTDAI)
    // await tx.wait()
    // const USDTDAIVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 USDT-DAI vault (proxy) contract address:", USDTDAIVaultAddr)

    // // Deploy USDC-DAI
    // const dataUSDCDAI = avaxVaultL1Interface.encodeFunctionData(
    //     "initialize",
    //     [
    //         "DAO L1 Png USDC-DAI", "daoUSDCDAI",
    //         pngRouterAddr, pngStakingContractAddr, PNGAddr, 11, true,
    //         treasuryAddr, communityAddr, adminAddr,
    //     ]
    // )
    // tx = await avaxVaultL1Factory.createVault(dataUSDCDAI)
    // await tx.wait()
    // const USDCDAIVaultAddr = await avaxVaultL1Factory.getVault((await avaxVaultL1Factory.getVaultLength()).sub(1))
    // console.log("DAO L1 USDC-DAI vault (proxy) contract address:", USDCDAIVaultAddr)
}
main()