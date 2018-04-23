const DavidToken = artifacts.require('DavidToken');

contract('DavidToken', function(accounts) {
  beforeEach(async function() {
    this.token = await DavidToken.new();
  });

  it('token contract metadata is correct', async function() {
    const name = await this.token.name();
    name.should.equal('DavidToken');

    const symbol = await this.token.symbol();
    symbol.should.equal('dToken');

    const decimals = await this.token.decimals();
    assert.equal(decimals, 18);
  });

  it('should have the right owner', async function() {
    const owner = await this.token.owner();
    owner.should.equal(accounts[0]);
  });

  it('should have total supply of 1 billion dTokens', async function() {
    var oneBillion = 1000000000 * Math.pow(10, 18);
    await this.token.mint(accounts[0], oneBillion);
    var totalSupply = await this.token.totalSupply();
    totalSupply.should.be.bignumber.equal(oneBillion), 'total supply of dTokens is 1 billion');
  });

  it('a limit of 1 billion dTokens can be minted', async function() {
    var fiveHundredMillion = 500000000 * Math.pow(10, 18);
    var sixHundredMillion = 600000000 * Math.pow(10, 18);
    var oneBillion = 1000000000 * Math.pow(10, 18);
    await this.token.mint(accounts[0], fiveHundredMillion);
    await this.token.mint(accounts[0], sixHundredMillion).should.be.rejectedWith('revert');

    var totalSupply = await this.token.totalSupply();
    totalSupply.should.be.bignumber.equal(fiveHundredMillion), 'total supply is 500 million');

    await this.token.mint(accounts[0], fiveHundredMillion);

    totalSupply = await this.token.totalSupply();

    totalSupply.should.be.bignumber.equal(oneBillion), 'total supply is 1 billion');

    // assert no more tokens can be minted once 1 billion tokens have been minted
    await this.token.mint(accounts[0], 1).should.be.rejectedWith('revert');
    await this.token.mint(accounts[0], DecimalsFormat(1)).should.be.rejectedWith('revert');
    await this.token.mint(accounts[0], DecimalsFormat(Billion(1))).should.be.rejectedWith('revert');
  });

  it('only the owner of the contract can unlock dTokens', async function() {
    var unlockedStatus;
    await this.token.mint(accounts[1], 100);
    await this.token.mint(accounts[2], 200);
    await this.token.mint(accounts[3], 300);

    await this.token.unlockToken({from: accounts[1]}).should.be.rejectedWith('revert');
    await this.token.unlockToken({from: accounts[2]}).should.be.rejectedWith('revert');
    await this.token.unlockToken({from: accounts[3]}).should.be.rejectedWith('revert');

    unlockedStatus = await this.token.unlocked();
    assert.equal(unlockedStatus, false);

    await this.token.unlockToken({from: accounts[0]});
    unlockedStatus = await this.token.unlocked();
    assert.equal(unlockedStatus, true);
  });

  it('transfer or allocate calls should fail until unlocked is set to true', async function() {
    await this.token.mint(accounts[1], 100);
    await this.token.mint(accounts[2], 200);
    await this.token.mint(accounts[3], 300);

    await this.token.transfer(accounts[4], 100, {from: accounts[1]}).should.be.rejectedWith('revert');
    await this.token.transferFrom(accounts[1], accounts[2], 100, {from: accounts[1]}).should.be.rejectedWith('revert');
    await this.token.approve(accounts[4], 100, {from: accounts[1]}).should.be.rejectedWith('revert');
    await this.token.increaseApproval(accounts[4], 100, {from: accounts[1]}).should.be.rejectedWith('revert');
    await this.token.decreaseApproval(accounts[4], 100, {from: accounts[1]}).should.be.rejectedWith('revert');

    await this.token.unlockToken();

    await this.token.transfer(accounts[4], 100, {from: accounts[1]});
    await this.token.approve(accounts[4], 100, {from: accounts[2]});
    await this.token.transferFrom(accounts[2], accounts[5], 100, {from: accounts[4]});
    await this.token.approve(accounts[4], 100, {from: accounts[3]});
    await this.token.increaseApproval(accounts[4], 100, {from: accounts[3]});
    await this.token.decreaseApproval(accounts[4], 100, {from: accounts[3]});

    var balance = await this.token.balanceOf(accounts[1]);
    balance.should.be.bignumber.equal(0);

    balance = await this.token.balanceOf(accounts[2]);
    balance.should.be.bignumber.equal(100);

    balance = await this.token.balanceOf(accounts[3]);
    balance.should.be.bignumber.equal(300);

    balance = await this.token.balanceOf(accounts[4]);
    balance.should.be.bignumber.equal(100);

    balance = await this.token.balanceOf(accounts[5]);
    balance.should.be.bignumber.equal(100);
  });

});
