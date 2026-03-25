cat > README.md << 'EOF'
# Bitcoin Transaction Decoding Assignment

## Task 1: Manual Decode
See `manual-decode.md`

## Task 2: Decoder
- Language: JavaScript (Node.js)
- File: `decoder.js`
- Fully manual decoder, no external libraries
- Correctly handles SegWit (marker + flag + witness data)

## How to Run
```bash
node decoder.js > output.txt
