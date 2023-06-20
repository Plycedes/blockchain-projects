module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts;
    const chainId = network.config.chainId;
};

// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre;
// };

// async function deployFunction(hre) {
//     console.log("Test");
// }
// module.exports.default = deployFunction;
