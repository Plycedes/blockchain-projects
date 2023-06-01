const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const abi = fs.readFileSync("./Storage_sol_Storage.abi", "utf8");
    const binary = fs.readFileSync("./Storage_sol_Storage.bin", "utf8");
    const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

    console.log("Deploying...");
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment(1);
    const addr = await contract.getAddress();
    console.log(`Contract Address: ${addr}`);

    const favoriteNumber = await contract.retrive();
    console.log(`Current favorite number: ${favoriteNumber.toString()}`);

    let transactionResponse = await contract.store(69);
    await transactionResponse.wait(1);
    const newfavNumber = await contract.retrive();
    console.log(`New favorite number: ${newfavNumber}`);
}

//http://127.0.0.1:7545

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
