const { accounts, contract, web3 } = require('@openzeppelin/test-environment');
const { expect } = require('chai');

const { expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');

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

async function sign(contract, tokenId, msg, price, address) {
  const hash = await contract.hashTokenUri(tokenId, msg, price);
  const signature = fixSignature(await web3.eth.sign(hash, address));

  return {
    hash,
    signature
  }
}

describe('MagicToken42', function () {
  const [ owner, other ] = accounts;

  let theContract = null;

  const uri = 'foo.bar';
  const tokenId = 42;
  const price = 100;

  this.beforeEach(async () => {
    theContract = await MagicToken42.new({ from: owner });
  })

  describe('#awardItem', async () => {
    it('awards item to buyer', async function () {
      const { hash, signature } = await sign(theContract, tokenId, uri, price, owner);

      const txReceipt = await theContract.awardItem(
        other,
        tokenId,
        uri,
        price,
        hash,
        signature,
        { from: other, value: price }
      );

      expectEvent(
        txReceipt, 'Transfer', {
          from: constants.ZERO_ADDRESS,
          to: other
        }
      );

      expect((await theContract.ownerOf(tokenId))
        .toString()).to.equal(other);
    });

    it('fails if uri not signed by owner', async function () {
      const { hash, signature } = await sign(theContract, tokenId, uri, price, other);

      await expectRevert(
        theContract.awardItem(
          other,
          tokenId,
          uri,
          price,
          hash,
          signature,
          { from: other, value: price }
        ),
        'Token metadata was not signed by MT42 owner'
      );
    });

    it('fails if hash does not match provided tokenUri', async function () {
      const { hash, signature } = await sign(theContract, tokenId, 'another.uri', price, owner);

      await expectRevert(
        theContract.awardItem(
          other,
          tokenId,
          uri,
          price,
          hash,
          signature,
          { from: other, value: price }
        ),
        'Invalid Token hash'
      );
    });

    it('fails if a second buyer attempts to buy the same token', async function () {
      const anotherBuyer = accounts[2];

      const { hash, signature } = await sign(theContract, tokenId, uri, price, owner);

      await theContract.awardItem(
        other,
        tokenId,
        uri,
        price,
        hash,
        signature,
        { from: other, value: price }
      );

      await expectRevert(
        theContract.awardItem(
          anotherBuyer,
          tokenId,
          uri,
          price,
          hash,
          signature,
          { from: anotherBuyer, value: price }
        ),
        'Item already sold'
      );
    });

    it('fails if price is not high enough', async function () {
      const { hash, signature } = await sign(theContract, tokenId, uri, price, owner);

      await expectRevert(
        theContract.awardItem(
          other,
          tokenId,
          uri,
          price,
          hash,
          signature,
          { from: other, value: price - 1 }
        ),
        'Value sent does not match token price.'
      );
    });

    it('fails if price is not low enough', async function () {
      const { hash, signature } = await sign(theContract, tokenId, uri, price, owner);

      await expectRevert(
        theContract.awardItem(
          other,
          tokenId,
          uri,
          price,
          hash,
          signature,
          { from: other, value: price + 1 }
        ),
        'Value sent does not match token price.'
      );
    });

    it('fails if tokenId does not match signature', async function () {
      const { hash, signature } = await sign(theContract, tokenId + 1, uri, price, owner);

      await expectRevert(
        theContract.awardItem(
          other,
          tokenId,
          uri,
          price,
          hash,
          signature,
          { from: other, value: price }
        ),
        'Invalid Token hash'
      );
    });

    it('fails if price does not match signature', async function () {
      const { hash, signature } = await sign(theContract, tokenId, uri, price + 1, owner);

      await expectRevert(
        theContract.awardItem(
          other,
          tokenId,
          uri,
          price,
          hash,
          signature,
          { from: other, value: price }
        ),
        'Invalid Token hash'
      );
    });
  });
});
