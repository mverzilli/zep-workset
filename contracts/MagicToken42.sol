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
    uint256 price,
    bytes32 tokenURIHash,
    bytes memory signedTokenURI
  ) public payable {
    require(msg.value == price, 'Value sent does not match token price');
    require(!_exists(tokenId), 'Item already sold');

    bytes32 checkHash = hashTokenUri(tokenId, tokenUri, price);
    require(checkHash == tokenURIHash, "Invalid Token hash");

    bytes32 ethSigned = ECDSA.toEthSignedMessageHash(tokenURIHash);
    address signer = ECDSA.recover(ethSigned, signedTokenURI);

    require(signer != address(0), "Invalid Token Metadata signer");
    require(signer == owner(), "Token metadata was not signed by MT42 owner");

    _mint(to, tokenId);
    _setTokenURI(tokenId, tokenUri);
  }

  function hashTokenUri(uint256 tokenId, string memory tokenUri, uint256 price) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(tokenId, tokenUri, price));
  }
}
