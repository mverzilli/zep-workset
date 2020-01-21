const { accounts, contract } = require('@openzeppelin/test-environment');
const { expect } = require('chai');

const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const MagicToken42 = contract.fromArtifact('MagicToken42');

describe('MagicToken42', function () {
  const [ owner, other ] = accounts;

  let theContract = null;

  this.beforeEach(async () => {
    theContract = await MagicToken42.new({ from: owner });
  })

  it('awards item to buyer', async function () {
    const txReceipt = await theContract.awardItem(other, 'foo.bar', { from: other });

    console.log(txReceipt.logs[0]);

    const newTokenId = txReceipt.logs[0].args.tokenId;

    expect((await theContract.ownerOf(newTokenId, { from: other }))
      .toString()).to.equal(other);
  });
});
