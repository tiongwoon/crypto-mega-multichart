import React from "react";
import styled from "styled-components";
import ChartSection from "./components/ChartSection";
import TableSection from "./components/TableSection";
import { ChartProvider } from "./context/ChartContext";

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #000000;
  color: #ffffff;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
`;

const MainContent = styled.div`
  display: flex;
  width: 100%;
  padding: 20px;
  gap: 20px;
`;

const ChartContainer = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TableContainer = styled.div`
  flex: 1;
  border-left: 1px solid #8a2be2;
  padding-left: 20px;
`;

function App() {
  return (
    <ChartProvider>
      <AppContainer>
        <MainContent>
          <ChartContainer>
            <ChartSection />
          </ChartContainer>
          <TableContainer>
            <TableSection />
          </TableContainer>
        </MainContent>
      </AppContainer>
    </ChartProvider>
  );
}

export default App;
