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
}