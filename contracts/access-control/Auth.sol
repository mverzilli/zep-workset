pragma solidity ^0.5.0;

contract Auth {
  address private administrator;

  constructor () public {
    administrator = msg.sender;
  }

  function isAdministrator(address user) public view returns (bool) {
    return user == administrator;
  }
}
