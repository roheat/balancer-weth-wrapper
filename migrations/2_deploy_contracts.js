var BPoolEthWrapper = artifacts.require("./BPoolEthWrapper.sol");
const KOVAN_WETH_ADDRESS = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";

module.exports = function (deployer) {
  deployer.deploy(BPoolEthWrapper, KOVAN_WETH_ADDRESS);
};
