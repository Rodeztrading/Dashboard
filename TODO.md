# TODO List for TradeWorkflow Loss Result Image Feature

## Tasks
- [x] Update types.ts to include optional resultImage in VisualTrade interface
- [x] Modify TradeWorkflow.tsx to add result image upload when outcome is 'LOSS'
- [x] Update handleSave in TradeWorkflow.tsx to include resultImage in the trade object
- [x] Test the feature by registering a loss trade and verifying the result image upload (dev server running at http://localhost:3000/)
