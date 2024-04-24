require("dotenv").config();
const express = require("express");
const {IgApiClient} = require('instagram-private-api');
const morgan = require("morgan");
const chalk = require('chalk')

const app = express();


require("dotenv").config();
app.use(express.json());
app.use(morgan("dev"));

const ig = new IgApiClient();

ig.state.generateDevice(process.env.IG_USERNAME);

(async () => {
  await ig.simulate.preLoginFlow();
  console.log(chalk.blue('Starting to login... please wait...'))
  const loggedInUser = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  console.log(chalk.green('Successfully logged in as: ' + loggedInUser.username))

  const followingFeed = ig.feed.accountFollowing(ig.state.cookieUserId);
  const following = await getAllItemsFromFeed(followingFeed);

  console.log(chalk.yellow('Total following: ' + following.length))
  
  
  for (let i = 0; i < following.length; i++) {
    const user = following[i];
    await ig.friendship.destroy(user.pk);
    console.log(chalk.red(`unfollowed ${user.username}`));
    const progress = ((i + 1) / following.length) * 100;
    console.log(chalk.green(progress.toFixed(0) + "%"));

    const time = Math.round(Math.random() * 15000) + 1000;
    await new Promise(resolve => setTimeout(resolve, time));
  }
})();

async function getAllItemsFromFeed(feed) {
  let items = [];
  do {
    items = items.concat(await feed.items());
  } while (feed.isMoreAvailable());
  return items;
}

console.log(chalk.yellow.bgBlack('Spawning Bot to process request...'))
