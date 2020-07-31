const BPoolEthWrapper = artifacts.require("./BPoolEthWrapper.sol");
const IBPool = artifacts.require("./interfaces/IBPool.sol");
// const IERC20 = artifacts.require("./interfaces/IERC20.sol");

// const KOVAN_WETH_ADDRESS = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";
const KOVAN_BPOOL_ADDRESS = "0x8aEAadd06C633A75D3e830aa0bd1C51373c4Afb7";

contract("BPoolEthWrapper", (accounts) => {
  let bPoolEthWrapperInstance;
  let bPoolInstance;

  beforeEach("Deploy the contract before each test", async () => {
    bPoolEthWrapperInstance = await BPoolEthWrapper.deployed();
    bPoolInstance = await IBPool.at(KOVAN_BPOOL_ADDRESS);
    // console.log(`Contract deployed at: ${bPoolEthWrapperInstance.address}`);
  });

  it("should successfully join by add 0.01 WETH liquidity to BPool", async () => {
    try {
      await bPoolEthWrapperInstance.joinswapEthAmountIn(
        KOVAN_BPOOL_ADDRESS,
        web3.utils.toWei("0.01", "ether"),
        { from: accounts[0], value: web3.utils.toWei("0.01", "ether") }
      );
      assert.equal(true, true);
    } catch (e) {
      console.log(e.message);
      assert(false, "joinswapEthAmountIn failed");
    }
  });

  it("should revert if _minPoolAmountOut is higher than the amount of BPTs sent back by BPool", async () => {
    try {
      await bPoolEthWrapperInstance.joinswapEthAmountIn(
        KOVAN_BPOOL_ADDRESS,
        web3.utils.toWei("1", "ether"),
        {
          from: accounts[0],
          value: web3.utils.toWei("0.01", "ether"),
          gas: "1000000",
        }
      );
      assert(false, "the contract should throw here");
    } catch (error) {
      assert(/revert/.test(error), 'the error message should contain "revert"');
    }
  });

  it("user approves BPoolEthWrapper contract to spend BPTs", async () => {
    await bPoolInstance.approve(
      bPoolEthWrapperInstance.address,
      web3.utils.toWei(Number.MAX_SAFE_INTEGER.toString(), "ether"),
      {
        from: accounts[0],
      }
    );
    const allowance = await bPoolInstance.allowance(
      accounts[0],
      bPoolEthWrapperInstance.address
    );
    assert.equal(
      allowance,
      web3.utils.toWei(Number.MAX_SAFE_INTEGER.toString(), "ether"),
      "BPTs not approved successfully"
    );
  });

  it("should successfully exit by removing 0.01 WETH liquidity from BPool", async () => {
    await bPoolInstance.approve(
      bPoolEthWrapperInstance.address,
      web3.utils.toWei(Number.MAX_SAFE_INTEGER.toString(), "ether"),
      {
        from: accounts[0],
      }
    );

    try {
      await bPoolEthWrapperInstance.exitswapEthAmountOut(
        KOVAN_BPOOL_ADDRESS,
        web3.utils.toWei("0.01", "ether"),
        web3.utils.toWei("0.1", "ether"),
        { from: accounts[0], gas: "1000000" }
      );
      assert(true);
    } catch (e) {
      console.log(e.message);
      assert(false, "exitswapEthAmountOut failed");
    }
  });
});
