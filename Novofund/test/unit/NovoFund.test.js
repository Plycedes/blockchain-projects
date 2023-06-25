const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

//describe the contract(biggest umbralla)
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NovoFund", async function () {
          let novoFund;
          let deployer;
          let mockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1");

          //deploy the contracts to test
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]); //execute all the deploy scripts at once
              novoFund = await ethers.getContract("NovoFund", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await novoFund.s_priceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe("receive", async function () {
              it("Calls fund function", async function () {
                  await expect(novoFund.fund());
              });
          });

          describe("fallback", async function () {
              it("Calls fund function", async function () {
                  await expect(novoFund.fund());
              });
          });

          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(novoFund.fund()).to.be.reverted;
              });

              it("Updates the amount funded data structure", async function () {
                  await novoFund.fund({ value: sendValue });
                  const response = await novoFund.s_addressToAmountFunded(
                      deployer
                  );
                  assert.equal(response.toString(), sendValue.toString());
              });

              it("Adds funder to funders array", async function () {
                  await novoFund.fund({ value: sendValue });
                  const s_funder = await novoFund.s_funder(0);
                  assert.equal(s_funder, deployer);
              });
          });

          describe("withdraw", async function () {
              this.beforeEach(async function () {
                  await novoFund.fund({ value: sendValue });
              });

              it("Withdraw ETH from a single founder", async function () {
                  //get initial balance
                  const startingNovoFundBalance =
                      await novoFund.provider.getBalance(novoFund.address);
                  const startingDeployerBalance =
                      await novoFund.provider.getBalance(deployer);

                  //get gas cost
                  const transactionRespone = await novoFund.withdraw();
                  const transactionReciept = await transactionRespone.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReciept;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  //get balance after withdrawing
                  const endingNovoFundBalance =
                      await novoFund.provider.getBalance(novoFund.address);
                  const endingDeployerBalance =
                      await novoFund.provider.getBalance(deployer);

                  assert.equal(endingNovoFundBalance, 0);

                  //check if inital contract + deployer balance is = final deployer balance plus + cost
                  assert.equal(
                      startingNovoFundBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("Allows us to withdraw with multiple funders", async function () {
                  //gets accounts and funds the contract using each account
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const novoFundConnectedContract = await novoFund.connect(
                          accounts[i]
                      ); //connecting each account to contract to fund
                      await novoFundConnectedContract.fund({
                          value: sendValue,
                      });
                  }

                  const startingNovoFundBalance =
                      await novoFund.provider.getBalance(novoFund.address);
                  const startingDeployerBalance =
                      await novoFund.provider.getBalance(deployer);

                  const transactionRespone = await novoFund.withdraw();
                  const transactionReciept = await transactionRespone.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReciept;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingNovoFundBalance =
                      await novoFund.provider.getBalance(novoFund.address);
                  const endingDeployerBalance =
                      await novoFund.provider.getBalance(deployer);

                  assert.equal(endingNovoFundBalance, 0);
                  assert.equal(
                      startingNovoFundBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  //checks if all the funders are removed
                  await expect(novoFund.s_funder(0)).to.be.reverted;

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await novoFund.s_addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it("Only allows the ownner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const nonOwner = accounts[1];
                  const nonOwnerConnectedContract = await novoFund.connect(
                      nonOwner
                  );

                  await expect(nonOwnerConnectedContract.withdraw()).to.be
                      .reverted;
              });

              it("Cheaper withdraw testing", async function () {
                  //gets accounts and funds the contract using each account
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const novoFundConnectedContract = await novoFund.connect(
                          accounts[i]
                      ); //connecting each account to contract to fund
                      await novoFundConnectedContract.fund({
                          value: sendValue,
                      });
                  }

                  const startingNovoFundBalance =
                      await novoFund.provider.getBalance(novoFund.address);
                  const startingDeployerBalance =
                      await novoFund.provider.getBalance(deployer);

                  const transactionRespone = await novoFund.cheaperWithdraw();
                  const transactionReciept = await transactionRespone.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReciept;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingNovoFundBalance =
                      await novoFund.provider.getBalance(novoFund.address);
                  const endingDeployerBalance =
                      await novoFund.provider.getBalance(deployer);

                  assert.equal(endingNovoFundBalance, 0);
                  assert.equal(
                      startingNovoFundBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  //checks if all the funders are removed
                  await expect(novoFund.s_funder(0)).to.be.reverted;

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await novoFund.s_addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
          });
      });
