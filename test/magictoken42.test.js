const { accounts, contract, web3 } = require('@openzeppelin/test-environment');
const { expect } = require('chai');

const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const MagicToken42 = contract.fromArtifact('MagicToken42');

function fixSignature (signature) {
  // in geth its always 27/28, in ganache its 0/1. Change to 27/28 to prevent
  // signature malleability if version is 0/1
  // see https://github.com/ethereum/go-ethereum/blob/v1.8.23/internal/ethapi/api.go#L465
  let v = parseInt(signature.slice(130, 132), 16);
  if (v < 27) {
    v += 27;
  }
  const vHex = v.toString(16);
  return signature.slice(0, 130) + vHex;
}

async function sign(contract, msg, address) {
  const hash = await contract.hashTokenUri(msg);
  const signature = fixSignature(await web3.eth.sign(hash, address));

  return {
    hash,
    signature
  }
}

describe('MagicToken42', function () {
  const [ owner, other ] = accounts;

  let theContract = null;

  this.beforeEach(async () => {
    theContract = await MagicToken42.new({ from: owner });
  })

  it('awards item to buyer', async function () {
    const uri = 'foo.bar';
    const { hash, signature } = await sign(theContract, uri, owner);

    const txReceipt = await theContract.awardItem(
      other,
      uri,
      hash,
      signature,
      { from: other }
    );

    const newTokenId = txReceipt.logs[0].args.tokenId;

    expect((await theContract.ownerOf(newTokenId, { from: other }))
      .toString()).to.equal(other);
  });

  it('fails if uri not signed by owner', async function () {
    const uri = 'foo.bar';
    const { hash, signature } = await sign(theContract, uri, other);

    await expectRevert(
      theContract.awardItem(other, uri, hash, signature, { from: other }),
      'Token metadata was not signed by MT42 owner'
    )
  });
});
