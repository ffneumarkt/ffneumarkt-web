type GridBlock = {
    id: string;
    position: string;
};

const GridBlocks: GridBlock[] = [
    {
        id: "A1",
        position: "col-start-1 col-span-2 row-start-1 row-span-1",
    },
    {
        id: "C1",
        position: "col-start-3 col-span-1 row-start-1 row-span-1",
    },
    {
        id: "A2",
        position: "col-start-1 col-span-1 row-start-2 row-span-1",
    },
    {
        id: "B2",
        position: "col-start-2 col-span-2 row-start-2 row-span-1",
    },
    {
        id: "A3",
        position: "col-start-1 col-span-2 row-start-3 row-span-1",
    },
    {
        id: "C3",
        position: "col-start-3 col-span-1 row-start-3 row-span-1",
    },
];

export default GridBlocks;
