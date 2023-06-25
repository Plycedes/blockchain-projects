const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const deployer = await getNamedAccounts().deployer;
    const novoFund = await ethers.getContract("NovoFund", deployer);
    const sendValue = ethers.utils.parseEther("0.1");

    console.log("Deploying contract...");
    const transactionRespone = await novoFund.fund({ value: sendValue });
    await transactionRespone.wait(1);
    console.log("Successfully funded!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
