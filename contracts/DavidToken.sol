pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "zeppelin-solidity/contracts/token/PausableToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * ERC20 DavidToken smart contract defining basic parameters of an ERC20 Token.
 */

contract DavidToken is MintableToken {
  uint8 public constant decimals = 18;
  string public constant name = "DavidToken";
  string public constant symbol = "dToken";

  // Maximum supply of dToken is 1 Billion
  uint256 public constant maxDTokenSupply = 1000 * 1000 * 1000 * (10 ** uint256(decimals));
  // Flag controlling if dToken can be transferred or traded
  bool public unlocked = false;

  event DavidTokenUnlocked();

  function DavidToken() public {
  }

  function mint(address to, uint256 amount) onlyOwner public returns (bool) {
    // totalSupply obtained from MintableToken.sol (zeppelin-solidity library)
    require(totalSupply + amount <= maxDTokenSupply);
    // Calls mint func in MintableToken.sol (zeppelin-solidity library)
    return super.mint(to, amount);
  }

  function unlockToken() onlyOwner public {
    require (!unlocked);
    unlocked = true;
    DavidTokenUnlocked();
  }

  // The following three functions callout to PausableToken.sol (zeppelin-solidity library)

  function transfer(address to, uint256 value) public returns (bool) {
    require(unlocked);
    return super.transfer(to, value);
  }

  function transferFrom(address from, address to, uint256 value) public returns (bool) {
    require(unlocked);
    return super.transferFrom(from, to, value);
  }

  function approve(address spender, uint256 value) public returns (bool) {
    require(unlocked);
    return super.approve(spender, value);
  }

  // Overriding the following two func calls to StandardToken.sol (zeppelin-solidity library)
  // Overriding necessary because of requirement of checking unlocked flag prior to increasing or decreasing approval amount 
  // We have access to StandardToken.sol because we are importing MintableToken.sol which inherits from StandardToken.sol

  // Increase the amount of tokens that an owner allowed to a spender
  function increaseApproval(address spender, uint addedValue) public returns (bool) {
    require(unlocked);
    return super.increaseApproval(spender, addedValue);
  }

  // Decrease the amount of tokens that an owner allowed to a spender
  function decreaseApproval(address spender, uint subtractedValue) public returns (bool) {
    require(unlocked);
    return super.decreaseApproval(spender, subtractedValue);
  }

}
