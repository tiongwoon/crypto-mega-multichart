import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useChart } from "../context/ChartContext";

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

const TableSection = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addChart } = useChart();
  const [filters, setFilters] = useState({
    chain: "all",
    minMarketCap: "",
    maxMarketCap: "",
    sort: "h6_trending",
  });

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
                <Td>{asset.attributes.name}</Td>
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
    </TableContainer>
  );
};

export default TableSection;
