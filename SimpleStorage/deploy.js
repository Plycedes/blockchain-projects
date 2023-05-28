const ethers = require("ethers");
const fs = require("fs-extra");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    const wallet = new ethers.Wallet(
        "0x6b1b4bcd19fd1bff3d7d05d3d4506797636cd67961cb152a609611fb102318ad",
        provider
    );
    const abi = fs.readFileSync("./Storage_sol_Storage.abi", "utf8");
    const binary = fs.readFileSync("./Storage_sol_Storage.bin", "utf8");
    const contactFactory = new ethers.ContractFactory(abi, wallet, binary);
    console.log("Deploying...");
    const contract = await contactFactory.deploy();
    console.log(contract);
}

//http://127.0.0.1:7545

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
