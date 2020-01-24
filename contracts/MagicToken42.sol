pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract MagicToken42 is ERC721Full, Ownable {
  constructor() ERC721Full("MagicToken42", "MT42") public {
  }

  function awardItem(
    address to,
    uint256 tokenId,
    string memory tokenUri,
    bytes32 tokenURIHash,
    bytes memory signedTokenURI
  ) public {
    require(!_exists(tokenId), 'Item already sold');

    bytes32 checkHash = hashTokenUri(tokenId, tokenUri);
    require(checkHash == tokenURIHash, "Invalid Token URI hash");

    bytes32 ethSigned = ECDSA.toEthSignedMessageHash(tokenURIHash);
    address signer = ECDSA.recover(ethSigned, signedTokenURI);

    require(signer != address(0), "Invalid Token Metadata signer");
    require(signer == owner(), "Token metadata was not signed by MT42 owner");

    _mint(to, tokenId);
    _setTokenURI(tokenId, tokenUri);
  }

  function hashTokenUri(uint256 tokenId, string memory tokenUri) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(tokenId, tokenUri));
  }
}
