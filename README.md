# README

## ERC 721 unminted sale

### Proposed requirements

- Want to sell X number of collectibles, but don't want to pay for minting them upfront
- Public list of metadata (URL to somewhere) + a signed message for each one
- Buyers send funds to contract along with the metadata + signature they want to claim
- New tokens are minted on purchase
- Each metadata (collectible) can only be claimed once
- Possibility of frontrunning, but public sale so not important

### Actors

- Seller (let's assume just one seller for now).
- Buyer (an arbitrary number of potential buyers).

For simplicity, we'll assume the items sold are images.

### User stories

- As a Seller, I want to create a collection.
  - This instantiates and deploys a contract to the blockchain.
- As a Seller, I want to add items to a collection.
  - This generates a token URI, signs it with the Seller's private key, and stores it off-chain.
  - Note that we also need to sign the price, so we know how much to charge upon the sale.
- As a Seller, I want to remove unsold items from a collection.
  - I can think of two ways to accomplish this:
    - 1. To maintain a mapping of removed items in the contract. When the Seller removes an item, a function is called on the contract to add its URI to a blacklist. Then the mapping is checked each time a token is bought.
- As a Seller, I want to set the price of an unsold item.
- As a Seller, I want to know what items have been sold and which ones haven't.

- As a Buyer, I want to navigate a list of available items.
- As a Buyer, I want to buy an item that I picked.
- As a Buyer, I want to navigate my purchases, and see if they are confirmed.

