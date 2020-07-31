// SPDX-License-Identifier: MIT
// 0x8aEAadd06C633A75D3e830aa0bd1C51373c4Afb7 (WETH BPool #1)
// 0x9302470B18A65D0073E08C79345d8312e2fBE253 (Weth BPool #2)
// 0xd0a1e359811322d97991e03f863a0c30c2cf029c (Kovan WETH)
// 0.01 ETH = 10000000000000000 wei

// Step 1: call joinswapEthAmountIn()
// Step 2: IBPool at 0x8aEAadd06C633A75D3e830aa0bd1C51373c4Afb7 -> call approve()
// Step 3: call exitswapEthAmountOut()

pragma solidity >=0.4.21 <0.7.0;

import "./interfaces/IERC20.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IBPool.sol";

contract BPoolEthWrapper {
    
    IWETH weth;
    constructor(IWETH _weth) public {
        weth = _weth;
    }
    
    function joinswapEthAmountIn(IBPool _pool, uint _minPoolAmountOut) external payable {
        weth.deposit{value: msg.value}();
        approvePoolIfNeeded(address(weth), address(_pool));
        uint poolAmountOut = _pool.joinswapExternAmountIn(address(weth), msg.value, _minPoolAmountOut);
        _pool.transfer(msg.sender, poolAmountOut);
    }
    
    function exitswapEthAmountOut(IBPool _pool, uint _ethAmountOut, uint _maxPoolAmountIn) external payable {
        _pool.transferFrom(msg.sender, address(this), _maxPoolAmountIn);
        approvePoolIfNeeded(address(weth), address(_pool));
        uint poolAmountIn = _pool.exitswapExternAmountOut(address(weth), _ethAmountOut, _maxPoolAmountIn);
        if(poolAmountIn < _maxPoolAmountIn) {
            // refund unused bpt
            _pool.transfer(msg.sender, _maxPoolAmountIn - poolAmountIn);
        }
        weth.withdraw(_ethAmountOut);
        (bool success,) = msg.sender.call{value: _ethAmountOut}("");
        require(success, "ETH sending failed");
    }
    
    function approvePoolIfNeeded(address _token, address _pool) internal {
        if(IERC20(_token).allowance(address(this), _pool) < uint(-1)) {
            IERC20(_token).approve(_pool, uint(-1));
        }
    }
    
    receive() external payable {}
    
}