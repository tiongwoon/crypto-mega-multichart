import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { createChart } from "lightweight-charts";
import TokenDetailsModal from "./TokenDetailsModal";

const ChartContainer = styled.div`
  position: relative;
  height: 100%;
  min-height: 300px;
  background: #1a1a1a;
  border: 1px solid #8a2be2;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  cursor: pointer;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #8a2be2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  z-index: 10;

  &:hover {
    background: #9b4de3;
  }
`;

const AssetName = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  z-index: 10;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: #8a2be2;
  text-underline-offset: 4px;

  &:hover {
    color: #9b4de3;
  }
`;

const Chart = ({ data, onRemove }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const [chartData, setChartData] = useState(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokenDetails, setTokenDetails] = useState(null);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [allTokens, setAllTokens] = useState([]);

  console.log("Initial data:", data);
  console.log("Initial chartData:", chartData);

  // Function to fetch new data
  const fetchNewData = async () => {
    try {
      console.log("Fetching with:", {
        network: data.network,
        address: data.address,
      });
      const response = await fetch(
        `https://pro-api.coingecko.com/api/v3/onchain/networks/${data.network}/pools/${data.address}/ohlcv/minute`,
        {
          headers: {
            "x-cg-pro-api-key": process.env.REACT_APP_COINGECKO_API_KEY,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          cache: "no-store",
        }
      );
      const newData = await response.json();
      console.log("New data:", newData);
      setChartData({
        ...data,
        ohlcv_list: newData.data.attributes.ohlcv_list,
      });
    } catch (error) {
      console.error("Error fetching new chart data:", error);
    }
  };

  // Function to fetch token details
  const fetchTokenDetails = async () => {
    try {
      const response = await fetch(
        `https://pro-api.coingecko.com/api/v3/onchain/networks/${data.network}/pools/${data.address}/info`,
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
      }
    } catch (error) {
      console.error("Error fetching token details:", error);
    }
  };

  const handleChartClick = () => {
    fetchTokenDetails();
    setIsModalOpen(true);
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

  // Set up polling
  useEffect(() => {
    const pollInterval = setInterval(fetchNewData, 30000); // 30 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [data.network, data.address]);

  useEffect(() => {
    if (!chartContainerRef.current || !chartData?.ohlcv_list) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#1a1a1a" },
        textColor: "#ffffff",
      },
      grid: {
        vertLines: { color: "#2B2B43" },
        horzLines: { color: "#2B2B43" },
      },
      width: chartContainerRef.current.clientWidth - 20,
      height: chartContainerRef.current.clientHeight - 20,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 8,
        fixLeftEdge: false,
        lockVisibleTimeRangeOnResize: false,
        rightBarStaysOnScroll: true,
        borderVisible: false,
        visible: true,
        timeUnit: "minute",
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "price",
        precision: 5,
        minMove: 0.00001,
      },
    });

    // Format and sort the data for the chart
    //console.log("Raw OHLCV data:", chartData.ohlcv_list);

    const formattedData = chartData.ohlcv_list
      .map((candle) => {
        const formatted = {
          time: Math.floor(candle[0]),
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
        };
        return formatted;
      })
      .sort((a, b) => a.time - b.time);

    //console.log("Data before filtering:", formattedData);

    const filteredData = formattedData.filter((candle, index, array) => {
      const isDuplicate = index > 0 && candle.time === array[index - 1].time;
      if (isDuplicate) {
        console.log("Removing duplicate:", candle);
      }
      return index === 0 || !isDuplicate;
    });

    //console.log("Data after filtering:", filteredData);

    if (filteredData.length > 0) {
      candlestickSeries.setData(filteredData);
      chart.timeScale().fitContent();
    }

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.clientWidth - 20;
        const height = chartContainerRef.current.clientHeight - 20;
        chart.applyOptions({
          width: width,
          height: height,
        });
      }
    };

    // Use ResizeObserver for more reliable resizing
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [chartData]);

  return (
    <>
      <ChartContainer ref={chartContainerRef}>
        <AssetName onClick={handleChartClick}>{data.name}</AssetName>
        <RemoveButton onClick={onRemove}>X</RemoveButton>
      </ChartContainer>
      <TokenDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tokenDetails={tokenDetails}
        currentTokenIndex={currentTokenIndex}
        onNextToken={handleNextToken}
        onPrevToken={handlePrevToken}
        totalTokens={allTokens.length}
      />
    </>
  );
};

export default Chart;
