
# LowFee Solidity Launchpad

Our main vision is to allow anyone to get access to a good quality launchpad and tools for a very low amount of fees, trying to reach zero fee if possible. The existing launchpads have a lot of requirements, and doesn't really care for small ideas, or even big ideas with a low amount of funding. They only care about what can bring them money, and this project cares about everyone who have good ideas, and want to launch it but doesn't have funding to do it.

What about you be part of this crypto revolution, either by supporting or using it.
## FAQ

#### What are the networks allowed?

Currently we have it limited to BSC as we are developing a minimum usable version.

#### Can I help on the project?

Certainly! we are open to contributions with the reward of becoming a contributor

#### What stage is the project at?

Project is still trying to react a minimum viable version, we will launch it live soon that is ready.

#### Why should I care?

In the end of the day doesn't really matter, the point of the project is to help people who will identify with the lack of safe and cheap solutions while trying to launch their projects. 
## Roadmap

✔️ Finish the main features (Launch Token, Launch Campaign..)

➖ Add integration to PancakeSwap to launch the Liquidity pools after the Campaign is ready.

➖ Polish UI/UX

➖ Launch the project live
## Demo

The demo is comming soon we have the minimum amount of secure and usable features!


## Installation Development Env

The project is divided in 2 main folders
 - /lowfee (Folder for the truffle)
 - /lowfee/client (Folder for the react)


#### Preparing Truffle /lowfee
First you need to go to the lowfee folder and run the npm install
```bash
  cd lowfee
  npm install
```
With that done you can go to the lowfee/config.js and edit the truffle-config.js setting up the truffle as you want or keeping as the default.
Next you need to run ```truffle develop``` to start using it.

Before running compile and migrate inside the truffle console, you need to go on the /lowfee/contracts
and setup a few stuff here:

#### On /lowfee/contracts/LowFee.sol
Change the entityOwner to your wallet who is going to be used as admin.
You can set the _platformFee to what you believe is a fair fee.

#### On /lowfee/contracts/LowFeeAssets.sol
Change the entityOwner to your wallet who is going to be used as admin.

#### On /lowfee/contracts/LowFeeCampaign.sol
Change the _zeroFeeAddress to your wallet who is going to be used as admin.

Remember to run the compile and migrate before start using it. And keep it running while developing.


#### Preparing React /lowfee/client
Now make sure you opened a new terminal while truffle is running and you can do
```bash
  cd lowfee
  npm install
```
After that you can check the /lowfee/client/src/index.js where you can set the config for web3, drizzle, truffle and other stuff.
One of the important parts here is to make sure the global.env.entityWallet is set to one of your test wallets who is going to be the owner of the contracts.

## Authors

- [@darkwolf66](https://www.github.com/darkwolf66)


## Support

For support, email you can contact will.moraes.96@gmail.com.
## Our Funding

Our project have zero funding! Made from a Developer for people who need it.
## Optimizations

Will be nice to have a UI/UX designer going thought the layouts and optimizing/re-designing.
## License

[MIT](https://choosealicense.com/licenses/mit/)

