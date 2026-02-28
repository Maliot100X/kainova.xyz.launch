-- =====================================================
-- KAINOVA DATABASE SCHEMA FOR SUPABASE POSTGRESQL
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- AGENTS TABLE - AI Agents that launch tokens
-- =====================================================
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(255) UNIQUE NOT NULL,
    agent_name VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(44),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agents_agent_id ON agents(agent_id);

-- =====================================================
-- TOKENS TABLE - Tokens launched by agents
-- =====================================================
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mint_address VARCHAR(44) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    agent_id VARCHAR(255) REFERENCES agents(agent_id) ON DELETE CASCADE,
    wallet_address VARCHAR(44) NOT NULL,
    launch_fee_paid BOOLEAN DEFAULT FALSE,
    launch_fee_tx_hash VARCHAR(88),
    pump_url TEXT,
    tx_hash VARCHAR(88) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verify_tx_hash VARCHAR(88),
    website VARCHAR(255),
    twitter VARCHAR(255),
    telegram VARCHAR(255),
    funding_source VARCHAR(50) DEFAULT 'standard',
    dev_buy_sol DECIMAL(18, 9),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tokens_agent_id ON tokens(agent_id);
CREATE INDEX idx_tokens_mint_address ON tokens(mint_address);
CREATE INDEX idx_tokens_created_at ON tokens(created_at);

-- =====================================================
-- EARNINGS TABLE - Trading fees earned by agents
-- =====================================================
CREATE TABLE earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(255) REFERENCES agents(agent_id) ON DELETE CASCADE,
    mint_address VARCHAR(44) REFERENCES tokens(mint_address) ON DELETE CASCADE,
    amount DECIMAL(18, 9) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'held', 'failed')),
    tx_hash VARCHAR(88),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    distributed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_earnings_agent_id ON earnings(agent_id);
CREATE INDEX idx_earnings_mint_address ON earnings(mint_address);
CREATE INDEX idx_earnings_status ON earnings(status);

-- =====================================================
-- LAUNCH FEES TABLE - Tracks 0.035 SOL payments
-- =====================================================
CREATE TABLE launch_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(255) NOT NULL,
    amount DECIMAL(18, 9) DEFAULT 0.035,
    tx_hash VARCHAR(88) UNIQUE NOT NULL,
    sender_wallet VARCHAR(44),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_launch_fees_agent_id ON launch_fees(agent_id);
CREATE INDEX idx_launch_fees_tx_hash ON launch_fees(tx_hash);

-- =====================================================
-- UPLOADS TABLE - Image uploads
-- =====================================================
CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_uploads_created_at ON uploads(created_at);

-- =====================================================
-- SNIPER SUBSCRIPTIONS TABLE - Webhook notifications
-- =====================================================
CREATE TABLE sniper_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id VARCHAR(255) UNIQUE NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    webhook_url TEXT NOT NULL,
    wallet_address VARCHAR(44) NOT NULL,
    balance_sol DECIMAL(18, 9) DEFAULT 0,
    is_active BOOLEAN DEFAULT FALSE,
    notifications_sent INTEGER DEFAULT 0,
    total_deposited DECIMAL(18, 9) DEFAULT 0,
    total_charged DECIMAL(18, 9) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sniper_api_key ON sniper_subscriptions(api_key);
CREATE INDEX idx_sniper_subscriber_id ON sniper_subscriptions(subscriber_id);

-- =====================================================
-- SNIPER NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE sniper_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id VARCHAR(255) REFERENCES sniper_subscriptions(subscriber_id) ON DELETE CASCADE,
    mint_address VARCHAR(44) NOT NULL,
    payload TEXT,
    delivered BOOLEAN DEFAULT FALSE,
    charge_amount DECIMAL(18, 9) DEFAULT 0.001,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sniper_notifications_subscriber_id ON sniper_notifications(subscriber_id);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sniper_subscriptions_updated_at
    BEFORE UPDATE ON sniper_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFY SETUP - List all tables
-- =====================================================
SELECT 'Tables created successfully!' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
