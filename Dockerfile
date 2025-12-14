FROM ubuntu:24.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Update and install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    build-essential \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Bun 1.2.4
RUN curl -fsSL https://bun.sh/install | bash -s -- bun-v1.2.4

# Set Bun in PATH
ENV PATH="/root/.bun/bin:$PATH"

# Verify installation
RUN bun -v

# Set the default working directory
WORKDIR /app

# Copy project files
COPY package.json .

# Install dependencies
RUN bun install

# Expose necessary ports
EXPOSE 3000
