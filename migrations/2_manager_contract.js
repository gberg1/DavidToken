var DavidTokenManager = artifacts.require('../contracts/DavidTokenManager.sol');
var DavidToken = artifacts.require('../contracts/DavidToken.sol');

const duration = {
  seconds: function (val) { return val; },
  minutes: function (val) { return val * this.seconds(60); },
  hours: function (val) { return val * this.minutes(60); },
  days: function (val) { return val * this.hours(24); },
  weeks: function (val) { return val * this.days(7); },
  years: function (val) { return val * this.days(365); },
};

module.exports = function(deployer, network, accounts) {
  return liveDeploy(deployer, accounts);
};

async function liveDeploy(deployer, accounts) {
  var now = web3.eth.getBlock('latest').timestamp;
  var vesting_start = now + duration.days(7);
  return deployer.deploy(DavidTokenManager).then(async() => {
    const contract = await DavidTokenManager.deployed();
    await contract.mintTokensWithoutTimeVesting(accounts[1], 200000000 * Math.pow(10, 18));
    await contract.mintTokensWithTimeVesting(accounts[2], 200000000 * Math.pow(10, 18), vesting_start, duration.years(1), duration.years(4));
    await contract.finishMintingProcess();

    const token = DavidToken.at(await contract.token());
    const totalSupply = await token.totalSupply();

    console.log('Total dTokens minted: ', totalSupply.toString());
  });
}
