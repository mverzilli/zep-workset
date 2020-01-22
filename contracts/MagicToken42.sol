pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/drafts/Counters.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract MagicToken42 is ERC721Full, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() ERC721Full("MagicToken42", "MT42") public {
  }

  function awardItem(address to, string memory tokenUri, bytes32 tokenURIHash, bytes memory signedTokenURI) public returns (uint256) {
    bytes32 checkHash = hashTokenUri(tokenUri);
    require(checkHash == tokenURIHash, "Invalid Token URI hash");

    bytes32 ethSigned = ECDSA.toEthSignedMessageHash(tokenURIHash);
    address signer = ECDSA.recover(ethSigned, signedTokenURI);

    require(signer != address(0), "Invalid Token Metadata signer");
    require(signer == owner(), "Token metadata was not signed by MT42 owner");

    _tokenIds.increment();

    uint256 newItemId = _tokenIds.current();
    _mint(to, newItemId);
    _setTokenURI(newItemId, tokenUri);

    return newItemId;
  }

  function hashTokenUri(string memory tokenUri) public pure returns (bytes32) {
    return keccak256(abi.encode(tokenUri));
  }
}
