// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface IBPool {
    function joinswapExternAmountIn(address tokenIn, uint tokenAmountIn, uint minPoolAmountOut) external returns (uint poolAmountOut);
    function exitswapExternAmountOut(address tokenOut, uint tokenAmountOut, uint maxPoolAmountIn) external returns (uint poolAmountIn);
    function approve(address dst, uint amt) external returns (bool);
    function balanceOf(address whom) external view returns (uint);
    function allowance(address src, address dst) external view returns (uint);
    function transfer(address dst, uint amt) external returns (bool);
    function transferFrom(address src, address dst, uint amt) external returns (bool);
    function getBalance(address token) external view returns (uint); // tokenBalanceIn
    function getDenormalizedWeight(address token) external view returns (uint); // tokenWeightIn
    function totalSupply() external view returns (uint); // poolSupply
    function getTotalDenormalizedWeight() external view returns (uint); // totalWeight
    function getSwapFee() external view returns (uint); // swapFee
    function calcPoolOutGivenSingleIn(
        uint tokenBalanceIn, uint tokenWeightIn, uint poolSupply, uint totalWeight, uint tokenAmountIn, uint swapFee
    ) external pure returns (uint);
}