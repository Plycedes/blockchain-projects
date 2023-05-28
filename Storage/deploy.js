const ethers = require("ethers");
const fs = require("fs-extra");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    const wallet = new ethers.Wallet(
        "0x2971bc119b97a8a00a3f1db8d78b2b6ae3dbba2e4c46222e678713a0a0be979e",
        provider
    );
    const abi = fs.readFileSync("./Storage_sol_Storage.abi", "utf8");
    const binary = fs.readFileSync("./Storage_sol_Storage.bin", "utf8");
    const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
    console.log("Deploying...");
    const contract = await contractFactory.deploy();
    console.log(contract);
}

//http://127.0.0.1:7545

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
