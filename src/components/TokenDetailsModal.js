import React, { useEffect, useState } from "react";
import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border: 1px solid #8a2be2;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #8a2be2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;

  &:hover {
    background: #9b4de3;
  }
`;

const TokenImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-bottom: 16px;
`;

const TokenName = styled.h2`
  color: #ffffff;
  font-size: 24px;
  margin-bottom: 16px;
`;

const Description = styled.p`
  color: #ffffff;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
`;

const SocialLink = styled.a`
  color: #8a2be2;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: #9b4de3;
  }
`;

const NavigationControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const NavButton = styled.button`
  background: #8a2be2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #9b4de3;
  }

  &:disabled {
    background: #4a4a4a;
    cursor: not-allowed;
  }
`;

const TokenCounter = styled.div`
  color: #ffffff;
  font-size: 14px;
`;

const PoolDetails = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #2b2b43;
`;

const PoolDetailRow = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;
  color: #ffffff;
  font-size: 14px;
  gap: 8px;
`;

const PoolDetailLabel = styled.span`
  color: #ffffff;
  font-weight: 600;
`;

const formatMarketCap = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return value.toLocaleString();
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const TokenDetailsModal = ({
  isOpen,
  onClose,
  tokenDetails,
  currentTokenIndex,
  onNextToken,
  onPrevToken,
  totalTokens,
  network,
  address,
}) => {
  const [poolDetails, setPoolDetails] = useState(null);

  useEffect(() => {
    const fetchPoolDetails = async () => {
      if (!network || !address) return;

      try {
        const response = await fetch(
          `https://pro-api.coingecko.com/api/v3/onchain/networks/${network}/pools/${address}`,
          {
            headers: {
              "x-cg-pro-api-key": process.env.REACT_APP_COINGECKO_API_KEY,
            },
          }
        );
        const result = await response.json();
        if (result.data) {
          setPoolDetails(result.data.attributes);
        }
      } catch (error) {
        console.error("Error fetching pool details:", error);
      }
    };

    if (isOpen) {
      fetchPoolDetails();
    }
  }, [isOpen, network, address]);

  if (!isOpen || !tokenDetails) return null;

  const {
    name,
    image_url,
    description,
    telegram_handle,
    twitter_handle,
    websites,
  } = tokenDetails;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>X</CloseButton>

        <NavigationControls>
          <NavButton onClick={onPrevToken} disabled={currentTokenIndex === 0}>
            Previous Token
          </NavButton>
          <TokenCounter>
            Token {currentTokenIndex + 1} of {totalTokens}
          </TokenCounter>
          <NavButton
            onClick={onNextToken}
            disabled={currentTokenIndex === totalTokens - 1}
          >
            Next Token
          </NavButton>
        </NavigationControls>

        {image_url && <TokenImage src={image_url} alt={name} />}
        <TokenName>{name}</TokenName>
        {description && <Description>{description}</Description>}

        {poolDetails && (
          <PoolDetails>
            <PoolDetailRow>
              <PoolDetailLabel>FDV:</PoolDetailLabel>
              <span>${formatMarketCap(poolDetails.fdv_usd)}</span>
            </PoolDetailRow>
            <PoolDetailRow>
              <PoolDetailLabel>24H Volume:</PoolDetailLabel>
              <span>${formatMarketCap(poolDetails.volume_usd?.h24 || 0)}</span>
            </PoolDetailRow>
            <PoolDetailRow>
              <PoolDetailLabel>Liquidity:</PoolDetailLabel>
              <span>${formatMarketCap(poolDetails.reserve_in_usd || 0)}</span>
            </PoolDetailRow>
            <PoolDetailRow>
              <PoolDetailLabel>Pool Created:</PoolDetailLabel>
              <span>{formatDate(poolDetails.pool_created_at)}</span>
            </PoolDetailRow>
          </PoolDetails>
        )}

        <SocialLinks>
          {telegram_handle && (
            <SocialLink
              href={`https://t.me/${telegram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Telegram
            </SocialLink>
          )}
          {twitter_handle && (
            <SocialLink
              href={`https://twitter.com/${twitter_handle}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </SocialLink>
          )}
          {websites && websites[0] && (
            <SocialLink
              href={websites[0]}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </SocialLink>
          )}
        </SocialLinks>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TokenDetailsModal;
