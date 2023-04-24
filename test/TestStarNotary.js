const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    const block = await web3.eth.getBlock('latest');
    const next_gas_price = Math.ceil(block.baseFeePerGas);
    await instance.approve(user2, starId, { from: user1 , gasPrice:next_gas_price});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    const block = await web3.eth.getBlock('latest');
    const next_gas_price = Math.ceil(block.baseFeePerGas);
    await instance.approve(user2, starId, { from: user1 , gasPrice:next_gas_price});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    const block = await web3.eth.getBlock('latest');
    const next_gas_price = Math.ceil(block.baseFeePerGas);
    await instance.approve(user2, starId, { from: user1 , gasPrice:next_gas_price});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    const block1 = await web3.eth.getBlock('latest');
    const next_gas_price1 = Math.ceil(block1.baseFeePerGas);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice : next_gas_price1});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar)  ;
    assert.isTrue(value > starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {

    let tokenId = 123;
    let instance = await StarNotary.deployed();
    await instance.createStar('My star!', tokenId, {from: accounts[0]})

    let name = await instance.name()//.call()
    let symbol = await instance.symbol()//.call()

    assert.equal(name, "Stars Notary Token")
    assert.equal(symbol, "STAR")

});

it('lets 2 users exchange stars', async() => {

    let tokenId1 = 12345;
    let instance = await StarNotary.deployed();
    await instance.createStar('My star1!', tokenId1, {from: accounts[0]});
    let ownerId1 = await instance.ownerOf.call(tokenId1);

    let tokenId2 = 1234567;
    await instance.createStar('My star2!', tokenId2, {from: accounts[1]});

    let ownerId2 = await instance.ownerOf.call(tokenId2);

    const block = await web3.eth.getBlock('latest');
    const next_gas_price = Math.ceil(block.baseFeePerGas);
    await instance.approve(ownerId2, tokenId1, { from: ownerId1, gasPrice:next_gas_price });



    const next_gas_price1 = Math.ceil(block.baseFeePerGas);
    await instance.approve(ownerId1, tokenId2, { from: ownerId2, gasPrice:next_gas_price1 });

    await instance.exchangeStars(tokenId1, tokenId2, {from: ownerId1});


    assert.equal(ownerId1, await instance.ownerOf.call(tokenId2));
    assert.equal(ownerId2, await instance.ownerOf.call(tokenId1));

    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
});

it('lets a user transfer a star', async() => {

    let tokenId1 = 123456789;
    let instance = await StarNotary.deployed();
    await instance.createStar('My star1!', tokenId1, {from: accounts[0]});
    let ownerId1 = await instance.ownerOf.call(tokenId1);

    await instance.transferStar(accounts[1], tokenId1);
    let ownerId2 = await instance.ownerOf.call(tokenId1);

    assert.isTrue(ownerId1!=ownerId2)

    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
});

it('lookUptokenIdToStarInfo test', async() => {

    let tokenId1 = 1234567890;
    let instance = await StarNotary.deployed();
    await instance.createStar('My star1!', tokenId1, {from: accounts[0]});
    let result = await instance.lookUptokenIdToStarInfo.call(tokenId1)

    assert.equal(result, "My star1!")
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
});