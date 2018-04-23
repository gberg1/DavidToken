pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/TokenVesting.sol";
import './DavidToken.sol';

/**
 * DavidTokenManager is the contract that creates DavidTokens and manages minting process.
*/
contract DavidTokenManager is Ownable {
  using SafeMath for uint256;

  // Token being minted
  DavidToken public token;

  // map of address to TokenVesting.sol contract (zeppelin-solidity library)
  mapping (address => TokenVesting) public vesting;

  event DavidTokensMintedWithoutTimeVesting(address beneficiary, uint256 tokens);
  event DavidTokensMintedWithTimeVesting(address beneficiary, uint256 tokens, uint256 start, uint256 cliff, uint256 duration);

  function DavidTokenManager() public {
    token = new DavidToken();
  }

  function mintTokensWithoutTimeVesting(address beneficiary, uint256 tokens) public onlyOwner {
    require(tokens > 0);
    require(beneficiary != 0x0);

    // Calls mint func in MintableToken.sol (zeppelin-solidity library)
    require(token.mint(beneficiary, tokens));

    DavidTokensMintedWithoutTimeVesting(beneficiary, tokens);
  }

  function mintTokensWithTimeVesting(address beneficiary, uint256 tokens, uint256 start, uint256 cliff, uint256 duration) public onlyOwner {
    require(beneficiary != 0x0);
    require(tokens > 0);

    // TokenVesting.sol contract found in OpenZeppelin library
    vesting[beneficiary] = new TokenVesting(beneficiary, start, cliff, duration, false);
    // Calls mint func in MintableToken.sol (zeppelin-solidity library)
    require(token.mint(address(vesting[beneficiary]), tokens));

    DavidTokensMintedWithTimeVesting(beneficiary, tokens, start, cliff, duration);
  }

  function finishMintingProcess() public onlyOwner {
    // Calls finishMinting func in MintableToken.sol (zeppelin-solidity library)
    require(token.finishMinting());
  }

  // Calls unlockToken func in DavidToken.sol
  function unlockToken() public onlyOwner {
    token.unlockToken();
  }

  function releaseVestedTokens(address beneficiary) public {
    require(beneficiary != 0x0);

    TokenVesting tokenVesting = vesting[beneficiary];
    // Calls release func in TokenVesting.sol (zeppelin-solidity library)
    tokenVesting.release(token);
  }

}
