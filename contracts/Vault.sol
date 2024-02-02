// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Vault is ERC20, ReentrancyGuard {
    mapping (address => uint256) public nativeCoinDeposits;
    mapping (address => mapping (address => uint256)) public tokenDeposits;

    event Deposit(address indexed account, address indexed token, uint256 indexed amount);
    event Withdraw(address indexed account, address indexed token, uint256 indexed amount);
    event Wrap(address indexed account, uint256 indexed amount);
    event Unwrap(address indexed account, uint256 indexed amount);

    constructor() ERC20("Wrapped ETH", "WETH") {}

    function deposit(address token, uint256 amount) public payable nonReentrant {
        if (msg.value != 0) {
            require(token == address(0) && amount == msg.value);

            nativeCoinDeposits[msg.sender] += msg.value;
        } else {
            require(token != address(0) && amount > 0);

            IERC20 _token = IERC20(token);
            require(_token.allowance(msg.sender, address(this)) >= amount);

            tokenDeposits[msg.sender][token] += amount;
            _token.transferFrom(msg.sender, address(this), amount);
        }

        emit Deposit(msg.sender, token, amount);
    }

    function withdraw(address token, uint256 amount) public nonReentrant {
        if (token == address(0)) {
            require(nativeCoinDeposits[msg.sender] >= amount);

            nativeCoinDeposits[msg.sender] -= amount;
            payable(msg.sender).transfer(amount);
        } else {
            require(tokenDeposits[msg.sender][token] >= amount);

            tokenDeposits[msg.sender][token] -= amount;
            IERC20 _token = IERC20(token);
            _token.transfer(msg.sender, amount);
        }

        emit Withdraw(msg.sender, token, amount);
    }

    function wrap(uint256 amount) public nonReentrant {
        require(nativeCoinDeposits[msg.sender] >= amount);

        nativeCoinDeposits[msg.sender] -= amount;
        _mint(msg.sender, amount);

        emit Wrap(msg.sender, amount);
    }

    function unwrap(uint256 amount) public nonReentrant {
        require(balanceOf(msg.sender) >= amount);

        nativeCoinDeposits[msg.sender] += amount;
        _burn(msg.sender, amount);

        emit Unwrap(msg.sender, amount);
    }
}
