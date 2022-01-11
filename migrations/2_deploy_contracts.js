const LowFee = artifacts.require("LowFee");
const LowFeeAssets = artifacts.require("LowFeeAssets");

module.exports = function(deployer) {
    deployer.deploy(LowFee);
    deployer.deploy(LowFeeAssets);
};