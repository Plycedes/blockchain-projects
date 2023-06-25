const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const deployer = await getNamedAccounts().deployer;
    const novoFund = await ethers.getContract("NovoFund", deployer);

    console.log("Deploying contract...");
    const transactionRespone = await novoFund.withdraw();
    await transactionRespone.wait(1);
    console.log("Successfully withdrew!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
