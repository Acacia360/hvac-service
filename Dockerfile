# Step 1: Use official Node.js image
FROM node:18

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the entire project
COPY . .

# Step 6: Expose the port (match with your .env PORT)
EXPOSE 3029

# Step 7: Run the app
CMD ["node", "src/app.js"]
