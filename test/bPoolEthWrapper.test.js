const BPoolEthWrapper = artifacts.require("./BPoolEthWrapper.sol");
const IBPool = artifacts.require("./interfaces/IBPool.sol");
const IERC20 = artifacts.require("./interfaces/IERC20.sol");

const KOVAN_WETH_ADDRESS = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";
const KOVAN_BPOOL_ADDRESS = "0x8aEAadd06C633A75D3e830aa0bd1C51373c4Afb7";

contract("BPoolEthWrapper", (accounts) => {
  let bPoolEthWrapperInstance;
  let bPoolInstance;
  let erc20Instance;

  beforeEach("Deploy the contract before each test", async () => {
    bPoolEthWrapperInstance = await BPoolEthWrapper.deployed();
    // bPoolEthWrapperInstance = await BPoolEthWrapper.at(
    //   "0xf81e61ddd24aA071823d1470C14343aCDD5B2A29"
    // );
    bPoolInstance = await IBPool.at(KOVAN_BPOOL_ADDRESS);
    erc20Instance = await IERC20.at(KOVAN_WETH_ADDRESS);

    console.log(`Contract deployed at: ${bPoolEthWrapperInstance.address}`);
  });

  it("should successfully join by adding WETH liquidity to BPool", async () => {
    try {
      const oldBPoolWethBalance = await bPoolInstance.getBalance(
        KOVAN_WETH_ADDRESS
      );
      // Add 0.01 WETH to BPool
      await bPoolEthWrapperInstance.joinswapEthAmountIn(
        KOVAN_BPOOL_ADDRESS,
        "0",
        { from: accounts[0], value: web3.utils.toWei("0.01", "ether") }
      );

      const wethAllowanceForBPool = await erc20Instance.allowance(
        bPoolEthWrapperInstance.address,
        KOVAN_BPOOL_ADDRESS
      );
      const newBPoolWethBalance = await bPoolInstance.getBalance(
        KOVAN_WETH_ADDRESS
      );

      assert(wethAllowanceForBPool > 0, "WETH is not approved/unlocked");
      assert.equal(
        (newBPoolWethBalance - oldBPoolWethBalance).toString(),
        web3.utils.toWei("0.01", "ether"),
        "0.01 WETH is not added to the BPool"
      );
    } catch (e) {
      assert(false, "joinswapEthAmountIn failed");
    }
  });

  it("should successfully add liqudity when _minPoolAmountOut is set to max possible amount out", async () => {
    try {
      const oldBPoolWethBalance = await bPoolInstance.getBalance(
        KOVAN_WETH_ADDRESS
      );
      const tokenWightIn = await bPoolInstance.getDenormalizedWeight(
        KOVAN_WETH_ADDRESS
      );
      const poolSupply = await bPoolInstance.totalSupply();
      const totalWeight = await bPoolInstance.getTotalDenormalizedWeight();
      const swapFee = await bPoolInstance.getSwapFee();

      const maxPoolAmountOut = await bPoolInstance.calcPoolOutGivenSingleIn(
        oldBPoolWethBalance,
        tokenWightIn,
        poolSupply,
        totalWeight,
        web3.utils.toWei("0.01", "ether"),
        swapFee
      );

      await bPoolEthWrapperInstance.joinswapEthAmountIn(
        KOVAN_BPOOL_ADDRESS,
        maxPoolAmountOut.toString(),
        { from: accounts[0], value: web3.utils.toWei("0.01", "ether") }
      );

      const wethAllowanceForBPool = await erc20Instance.allowance(
        bPoolEthWrapperInstance.address,
        KOVAN_BPOOL_ADDRESS
      );
      const newBPoolWethBalance = await bPoolInstance.getBalance(
        KOVAN_WETH_ADDRESS
      );

      assert(wethAllowanceForBPool > 0, "WETH is not approved/unlocked");
      assert.equal(
        (newBPoolWethBalance - oldBPoolWethBalance).toString(),
        web3.utils.toWei("0.01", "ether"),
        "0.01 WETH is not added to the BPool"
      );
      assert(true);
    } catch (e) {
      assert(false, "joinswapEthAmountIn failed");
    }
  });

  it("should revert if _minPoolAmountOut is higher than the max possible amount out", async () => {
    try {
      const tokenBalanceIn = await bPoolInstance.getBalance(KOVAN_WETH_ADDRESS);
      const tokenWightIn = await bPoolInstance.getDenormalizedWeight(
        KOVAN_WETH_ADDRESS
      );
      const poolSupply = await bPoolInstance.totalSupply();
      const totalWeight = await bPoolInstance.getTotalDenormalizedWeight();
      const swapFee = await bPoolInstance.getSwapFee();

      const maxPoolAmountOut = await bPoolInstance.calcPoolOutGivenSingleIn(
        tokenBalanceIn,
        tokenWightIn,
        poolSupply,
        totalWeight,
        web3.utils.toWei("0.01", "ether"),
        swapFee
      );

      poolAmountOut = Number(maxPoolAmountOut.toString()) + 100; // little above max calculated limit

      await bPoolEthWrapperInstance.joinswapEthAmountIn(
        KOVAN_BPOOL_ADDRESS,
        poolAmountOut.toString(),
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
