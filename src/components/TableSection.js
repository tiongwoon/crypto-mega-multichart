import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useChart } from "../context/ChartContext";
import TokenDetailsModal from "./TokenDetailsModal";

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  position: relative;
  background: #1a1a1a;
  border-left: 1px solid #8a2be2;
  overflow: visible;
`;

const CollapseButton = styled.button`
  position: absolute;
  top: 20px;
  left: -20px;
  background: #8a2be2;
  color: white;
  border: none;
  border-radius: 4px;
  width: 20px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transform: translateX(${(props) => (props.isCollapsed ? "0" : "0")});

  &:hover {
    background: #9b4de3;
  }
`;

const CollapseIcon = styled.span`
  transform: rotate(${(props) => (props.isCollapsed ? "180deg" : "0deg")});
  transition: transform 0.3s ease;
  font-size: 12px;
`;

const TableContent = styled.div`
  opacity: ${(props) => (props.isCollapsed ? "0" : "1")};
  visibility: ${(props) => (props.isCollapsed ? "hidden" : "visible")};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  width: 100%;
  padding-left: 20px;
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background: #1a1a1a;
  border: 1px solid #8a2be2;
  border-radius: 8px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  color: #ffffff;
  font-size: 14px;
`;

const Input = styled.input`
  background: #2a2a2a;
  border: 1px solid #8a2be2;
  color: #ffffff;
  padding: 8px;
  border-radius: 4px;

  &:focus {
    outline: none;
    border-color: #9b4de3;
  }
`;

const Select = styled.select`
  background: #2a2a2a;
  border: 1px solid #8a2be2;
  color: #ffffff;
  padding: 8px;
  border-radius: 4px;

  &:focus {
    outline: none;
    border-color: #9b4de3;
  }
`;

const SubmitButton = styled.button`
  background: #8a2be2;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background: #9b4de3;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #1a1a1a;
  border: 1px solid #8a2be2;
  border-radius: 8px;
`;

const Th = styled.th`
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #8a2be2;
  color: #ffffff;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #2b2b43;
  color: #ffffff;
`;

const AddButton = styled.button`
  background: #8a2be2;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #9b4de3;
  }
`;

const AssetNameCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #2b2b43;
  color: #ffffff;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: #8a2be2;
  text-underline-offset: 4px;

  &:hover {
    color: #9b4de3;
  }
`;

const formatMarketCap = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return value.toLocaleString();
};

const formatPriceChange = (priceChange) => {
  if (priceChange === undefined || priceChange === null) return "0.00";
  return Number(priceChange).toFixed(2);
};

const TableSection = ({ onCollapseChange, isCollapsed }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addChart } = useChart();
  const [filters, setFilters] = useState({
    chain: "all",
    minMarketCap: "",
    maxMarketCap: "",
    minLiquidity: "",
    maxLiquidity: "",
    min24hVolume: "",
    max24hVolume: "",
    minPoolAge: "",
    maxPoolAge: "",
    sort: "h6_trending",
  });

  // Add state for token details modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokenDetails, setTokenDetails] = useState(null);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [allTokens, setAllTokens] = useState([]);

  const toggleCollapse = () => {
    onCollapseChange((prev) => !prev);
  };

  // Function to fetch token details
  const fetchTokenDetails = async (network, address) => {
    try {
      const response = await fetch(
        `https://pro-api.coingecko.com/api/v3/onchain/networks/${network}/pools/${address}/info`,
        {
          headers: {
            "x-cg-pro-api-key": process.env.REACT_APP_COINGECKO_API_KEY,
          },
        }
      );
      const result = await response.json();
      if (result.data && result.data.length > 0) {
        setAllTokens(result.data.map((item) => item.attributes));
        setTokenDetails(result.data[0].attributes);
        setCurrentTokenIndex(0);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching token details:", error);
    }
  };

  const handleNextToken = () => {
    if (currentTokenIndex < allTokens.length - 1) {
      const nextIndex = currentTokenIndex + 1;
      setCurrentTokenIndex(nextIndex);
      setTokenDetails(allTokens[nextIndex]);
    }
  };

  const handlePrevToken = () => {
    if (currentTokenIndex > 0) {
      const prevIndex = currentTokenIndex - 1;
      setCurrentTokenIndex(prevIndex);
      setTokenDetails(allTokens[prevIndex]);
    }
  };

  const fetchAssets = React.useCallback(async () => {
    setLoading(true);
    try {
      let url =
        "https://pro-api.coingecko.com/api/v3/onchain/pools/megafilter?page=1";

      // Add network filter
      if (filters.chain !== "all") {
        url += `&networks=${filters.chain}`;
      } else {
        url += "&networks=solana,base";
      }

      // Add market cap filters
      if (filters.minMarketCap) {
        url += `&fdv_usd_min=${filters.minMarketCap}`;
      }
      if (filters.maxMarketCap) {
        url += `&fdv_usd_max=${filters.maxMarketCap}`;
      }

      // Add liquidity filters
      if (filters.minLiquidity) {
        url += `&reserve_in_usd_min=${filters.minLiquidity}`;
      }
      if (filters.maxLiquidity) {
        url += `&reserve_in_usd_max=${filters.maxLiquidity}`;
      }

      // Add 24h volume filters
      if (filters.min24hVolume) {
        url += `&h24_volume_usd_min=${filters.min24hVolume}`;
      }
      if (filters.max24hVolume) {
        url += `&h24_volume_usd_max=${filters.max24hVolume}`;
      }

      // Add pool age filters
      if (filters.minPoolAge) {
        url += `&pool_created_hour_min=${filters.minPoolAge}`;
      }
      if (filters.maxPoolAge) {
        url += `&pool_created_hour_max=${filters.maxPoolAge}`;
      }

      // Add sort parameter
      url += `&sort=${filters.sort}`;

      const response = await axios.get(url, {
        headers: {
          "x-cg-pro-api-key": process.env.REACT_APP_COINGECKO_API_KEY,
        },
      });

      setAssets(response.data.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
    setLoading(false);
  }, [filters]);

  // Add initial data fetch
  useEffect(() => {
    fetchAssets();
  }, []); // Empty dependency array means this runs once on mount

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAssets();
  };

  return (
    <TableContainer>
      <CollapseButton onClick={toggleCollapse} isCollapsed={isCollapsed}>
        <CollapseIcon isCollapsed={isCollapsed}>◀</CollapseIcon>
      </CollapseButton>

      <TableContent isCollapsed={isCollapsed}>
        <FilterSection>
          <form onSubmit={handleSubmit}>
            <FilterGroup>
              <Label>Chain</Label>
              <Select
                name="chain"
                value={filters.chain}
                onChange={handleFilterChange}
              >
                <option value="all">All Chains</option>
                <option value="solana">Solana</option>
                <option value="base">Base</option>
              </Select>
            </FilterGroup>

            <FilterGroup>
              <Label>Min Market Cap</Label>
              <Input
                type="number"
                name="minMarketCap"
                value={filters.minMarketCap}
                onChange={handleFilterChange}
                placeholder="Enter min market cap"
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Max Market Cap</Label>
              <Input
                type="number"
                name="maxMarketCap"
                value={filters.maxMarketCap}
                onChange={handleFilterChange}
                placeholder="Enter max market cap"
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Min Liquidity</Label>
              <Input
                type="number"
                name="minLiquidity"
                value={filters.minLiquidity}
                onChange={handleFilterChange}
                placeholder="Enter min liquidity"
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Max Liquidity</Label>
              <Input
                type="number"
                name="maxLiquidity"
                value={filters.maxLiquidity}
                onChange={handleFilterChange}
                placeholder="Enter max liquidity"
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Min 24h Volume</Label>
              <Input
                type="number"
                name="min24hVolume"
                value={filters.min24hVolume}
                onChange={handleFilterChange}
                placeholder="Enter min 24h volume"
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Max 24h Volume</Label>
              <Input
                type="number"
                name="max24hVolume"
                value={filters.max24hVolume}
                onChange={handleFilterChange}
                placeholder="Enter max 24h volume"
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Min Pool Age (hours)</Label>
              <Input
                type="number"
                name="minPoolAge"
                value={filters.minPoolAge}
                onChange={handleFilterChange}
                placeholder="Enter min pool age"
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Max Pool Age (hours)</Label>
              <Input
                type="number"
                name="maxPoolAge"
                value={filters.maxPoolAge}
                onChange={handleFilterChange}
                placeholder="Enter max pool age"
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Sort</Label>
              <Select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
              >
                <option value="m5_trending">5 Min Trending</option>
                <option value="h1_trending">1 Hour Trending</option>
                <option value="h6_trending">6 Hours Trending</option>
                <option value="h24_trending">24 Hours Trending</option>
                <option value="h24_tx_count_desc">24h Transaction Count</option>
                <option value="h24_volume_usd_desc">24h Volume</option>
                <option value="h24_price_change_percentage_desc">
                  24h Price Change
                </option>
                <option value="pool_created_at_desc">Pool Creation Date</option>
              </Select>
            </FilterGroup>

            <SubmitButton type="submit">Submit</SubmitButton>
          </form>
        </FilterSection>

        <Table>
          <thead>
            <tr>
              <Th>Asset Name</Th>
              <Th>Market Cap</Th>
              <Th>24H Change</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <Td colSpan="4">Loading...</Td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id}>
                  <AssetNameCell
                    onClick={() =>
                      fetchTokenDetails(
                        asset.relationships.network.data.id,
                        asset.attributes.address
                      )
                    }
                  >
                    {asset.attributes.name}
                  </AssetNameCell>
                  <Td>{formatMarketCap(asset.attributes.fdv_usd)}</Td>
                  <Td>
                    {formatPriceChange(
                      asset.attributes.price_change_percentage?.h24
                    )}
                    %
                  </Td>
                  <Td>
                    <AddButton
                      onClick={() =>
                        addChart(
                          asset.relationships.network.data.id,
                          asset.attributes.address
                        )
                      }
                    >
                      Add
                    </AddButton>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <TokenDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tokenDetails={tokenDetails}
          currentTokenIndex={currentTokenIndex}
          onNextToken={handleNextToken}
          onPrevToken={handlePrevToken}
          totalTokens={allTokens.length}
        />
      </TableContent>
    </TableContainer>
  );
};

export default TableSection;
