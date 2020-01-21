pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/drafts/Counters.sol";

contract MagicToken42 is ERC721Full {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() ERC721Full("MagicToken42", "MT42") public {
  }

  function awardItem(address to, string memory tokenURI) public returns (uint256) {
    _tokenIds.increment();

    uint256 newItemId = _tokenIds.current();
    _mint(to, newItemId);
    _setTokenURI(newItemId, tokenURI);

    return newItemId;
  }
}
