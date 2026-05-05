
```javascript
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import readline from "readline";

const client = new Anthropic();

interface InvestmentAsset {
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

interface Portfolio {
  assets: InvestmentAsset[];
  cash: number;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

// Initialize portfolio with sample data
const portfolio: Portfolio = {
  assets: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 10,
      purchasePrice: 150,
      currentPrice: 175,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      shares: 5,
      purchasePrice: 2800,
      currentPrice: 3100,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      shares: 8,
      purchasePrice: 300,
      currentPrice: 380,
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      shares: 3,
      purchasePrice: 700,
      currentPrice: 950,
    },
  ],
  cash: 50000,
};

const conversationHistory: ConversationMessage[] = [];

// Helper functions for portfolio analysis
function getPortfolioSummary(): string {
  let totalValue = portfolio.cash;
  let totalInvested = 0;
  let totalCost = 0;

  portfolio.assets.forEach((asset) => {
    const currentValue = asset.shares * asset.currentPrice;
    const costValue = asset.shares * asset.purchasePrice;
    totalValue += currentValue;
    totalInvested += currentValue;
    totalCost += costValue;
  });

  const totalGain = totalValue - totalCost;
  const gainPercentage = ((totalGain / totalCost) * 100).toFixed(2);

  let summary = `PORTFOLIO SUMMARY\n`;
  summary += `================\n`;
  summary += `Total Portfolio Value: $${totalValue.toFixed(2)}\n`;
  summary += `Total Invested: $${totalInvested.toFixed(2)}\n`;
  summary += `Cash Available: $${portfolio.cash.toFixed(2)}\n`;
  summary += `Total Gain/Loss: $${totalGain.toFixed(2)} (${gainPercentage}%)\n\n`;

  summary += `HOLDINGS:\n`;
  summary += `---------\n`;
  portfolio.assets.forEach((asset) => {
    const currentValue = asset.shares * asset.currentPrice;
    const gain = currentValue - asset.shares * asset.purchasePrice;
    const gainPercent = ((gain / (asset.shares * asset.purchasePrice)) * 100).toFixed(
      2
    );
    summary += `${asset.symbol} (${asset.name})\n`;
    summary += `  Shares: ${asset.shares} @ $${asset.currentPrice}/share = $${currentValue.toFixed(2)}\n`;
    summary += `  Gain/Loss: $${gain.toFixed(2)} (${gainPercent}%)\n\n`;
  });

  return summary;
}

function getAssetDistribution(): string {
  let totalValue = portfolio.cash;
  const assetValues: { [key: string]: number } = {};

  portfolio.assets.forEach((asset) => {
    const value = asset.shares * asset.currentPrice;
    assetValues[asset.symbol] = value;
    totalValue += value;
  });

  let distribution = `ASSET DISTRIBUTION\n`;
  distribution += `===================\n`;
  distribution += `Cash: ${((portfolio.cash / totalValue) * 100).toFixed(2)}%\n`;

  portfolio.assets.forEach((asset) => {
    const percentage = ((assetValues[asset.symbol] / totalValue) * 100).toFixed(2);
    const barLength = Math.round(parseFloat(percentage) / 5);
    const bar = "█".repeat(barLength) + "░".repeat(20 - barLength);
    distribution += `${asset.symbol}: ${percentage}% ${bar}\n`;
  });

  return distribution;
}

function simulatePriceChange(symbol: string, percentChange: number): string {
  const asset = portfolio.assets.find((a) => a.symbol === symbol);
  if (!asset) {
    return `Asset ${symbol} not found in portfolio.`;
  }

  const oldPrice = asset.currentPrice;
  asset.currentPrice = asset.currentPrice * (1 + percentChange / 100);

  const difference = asset.currentPrice - oldPrice;
  return `${symbol} price updated: $${oldPrice.toFixed(2)} → $${asset.currentPrice.toFixed(
    2
  )} (${percentChange > 0 ? "+" : ""}${percentChange}%)`;
}

function buyAsset(symbol: string, shares: number, price: number): string {
  const cost = shares * price;
  if (portfolio.cash < cost) {
    return `Insufficient funds. Need $${cost.toFixed(2)}, have $${portfolio.cash.toFixed(
      2
    )}`;
  }

  const existingAsset = portfolio.assets.find((a) => a.symbol === symbol);
  if (existingAsset) {
    existingAsset.shares += shares;
    existingAsset.currentPrice = price;
  } else {
    portfolio.assets.push({
      symbol,
      name: `${symbol} Stock`,
      shares,
      purchasePrice: price,
      currentPrice: price,
    });
  }

  portfolio.cash -= cost;
  return `Bought ${shares} shares of ${symbol} at $${price}/share. Total cost: $${cost.toFixed(2