'use client';

import { Box, Stack, Typography, Button, Modal, TextField, Paper, styled, tableCellClasses } from "@mui/material";
import { firestore } from "./firebase";
import { collection, doc, getDocs, getDoc, query, setDoc, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from "@mui/material";

// Default styling.
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#D2C1B3',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

// Table columns.
const columns = [
  { id: 'name', label: 'Item Name', minWidth: 170 },
  { id: 'quantity', label: 'Quantity', minWidth: 100 },
  { id: 'actions', label: 'Actions', minWidth: 100, align: 'right' },
];

// Styled components for the table.
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#BBADA1",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
    backgroundColor: "#E7D7CB",
  },
  '&:nth-of-type(even)': {
    backgroundColor: "#F7EDE2",
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

// Main component.
export default function Home() {
  // State variables: pantry list and modal states.
  const [pantry, setPantry] = useState([]);
  // Modal state variables.
  const [openMod1, setOpenMod1] = useState(false);
  const [openMod2, setOpenMod2] = useState(false);
  const handleOpenMod1 = () => setOpenMod1(true);
  const handleCloseMod1 = () => setOpenMod1(false);
  const handleOpenMod2 = () => setOpenMod2(true);
  const handleCloseMod2 = () => setOpenMod2(false);
  // State variables for item name, quantity, and item to remove.
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [quantityToRemove, setQuantityToRemove] = useState(1);
  const [itemToRemove, setItemToRemove] = useState('');
  // State variables for pagination.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // State variable for search and filtered pantry list.
  const [search, setSearch] = useState('');
  const filteredPantry = pantry.filter( (item) => item.name.toLowerCase().includes(search.toLowerCase()));

  // Function to update the pantry list.
  const updatePantry = async () => {

    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach(doc => {
      pantryList.push({ name:doc.id, ...doc.data() });
    });
    console.log(pantryList);
    setPantry(pantryList);

  }

  // Use effect to update the pantry list on load.
  useEffect( () => {

    updatePantry();

  }, []);

  // Use effect to update the item to remove and quantity.
  useEffect( () => {

    setItemToRemove(itemToRemove);
    setItemQuantity(itemQuantity);

  }, [itemToRemove, itemQuantity]);

  // Function to add an item to the pantry.
  const addItem = async (item, count) => {
    // making sure the name is consistent
    const trimmed = item.trim();
    const itm = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    const docRef = doc(collection(firestore, 'pantry'), itm);
    // Check if the item already exists in the pantry
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const {quantity} = docSnap.data();
      await setDoc(docRef, {quantity: Number(quantity) + Number(count)});
    }
    else {
      await setDoc(docRef, {quantity: count});
    }
    await updatePantry();

  }

  // Function to remove an item from the pantry.
  const removeItem = async (item, count) => {

    const docRef = doc(collection(firestore, 'pantry'), item);
    // Check if the item already exists in the pantry
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const {quantity} = docSnap.data();
      if (Number(quantity) === Number(count)) {
        await deleteDoc(docRef);
      }
      else if (Number(quantity) > Number(count)) {
        await setDoc(docRef, {quantity: Number(quantity) - Number(count)});
      }
      else {
        console.log('Invalid quantity to remove.');
      }
    }
    await updatePantry();

  }

  // Return the main component.
  return (
  <Box 
    width="100vw" height="100vh"
    bgcolor={"#D2C1B3"}
    display={"flex"}
    justifyContent={"center"}
    flexDirection={"column"}
    alignItems={"center"}
    gap={3}
  >
    <Stack direction={"column"} spacing={2}>
    <Typography variant={'h3'} color={"#333"} textAlign={"center"}>Pantry Tracker</Typography>
    <Typography variant={'subtitle1'} color={"#333"} textAlign={"center"}>Pantry Management Made Easy.</Typography>

    <Box width="800px" display={"flex"} justifyContent={"center"} alignItems={"center"}>
      <TextField
        id="outlined-search"
        label="Search Pantry"
        type="search"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          '& label.Mui-focused': {
              color: '#543622', 
            },
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#725444',
            },
            '&.Mui-focused fieldset': {
              color: '#333',
              borderColor: '#725444',
            },
          },
        }}
      />
    </Box>
    </Stack>
    <Modal
      open={openMod1}
      onClose={handleCloseMod1}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Add Item
        </Typography>
        <form
            onSubmit={(e) => {
              e.preventDefault();
              addItem(itemName, itemQuantity);
              setItemName('');
              handleCloseMod1();
            }}
            autoComplete="off"
          >
            <Stack width="100%" direction={"row"} spacing={2}>
            <TextField 
            required
            id="outlined-required"
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            sx={{
              '& label.Mui-focused': {
                  color: '#543622', 
                },
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#725444',
                },
                '&.Mui-focused fieldset': {
                  color: '#333',
                  borderColor: '#725444',
                },
              },
            }}
            />
            <TextField
            required
            id="outlined-number"
            label="Quantity"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              inputProps: { min: 1 },
            }}
            value={itemQuantity}
            onChange={(e) => setItemQuantity(e.target.value)}
            sx={{
              '& label.Mui-focused': {
                  color: '#543622', 
                },
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#725444',
                },
                '&.Mui-focused fieldset': {
                  color: '#333',
                  borderColor: '#725444',
                },
              },
            }}
            />
            <Button type="submit"
              variant="contained"
              sx={{
                color: "white",
                bgcolor: "#725444",
                '&:hover': {
                  bgcolor: "#543622",
                },
              }}
              >Add</Button>
            </Stack>
        </form>
      </Box>
    </Modal>
    <Button style={{backgroundColor: "#BBADA1", }} variant="contained" onClick={handleOpenMod1}>
        Add Item</Button>
    <Box border={'1px solid #333'}>
    <Box
      width="800px"
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      >
      <Paper sx={{ width: '100%', overflow: 'auto' }}>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader aria-label="customized table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
              <StyledTableCell
                key={column.id}
                align={column.align}
                style={{ minWidth: column.minWidth }}
                >
                <Typography
                    variant={'h5'}
                    color={"#333"} 
                    textAlign={"center"}
                  >
                  {column.label}
                  </Typography>
              </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
          {filteredPantry.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => {
            return (
              <StyledTableRow
                hover
                role="checkbox"
                tabIndex={-1}
                key={item.name}
              >
                {columns.map((column) => {
                  const value = item[column.id];
                  return (
                    column.id === 'actions' ?
                    <StyledTableCell align={"center"}>
                    <Button 
                      style={{backgroundColor: "#BBADA1", }}
                      variant="contained"
                      onClick={() => {
                        handleOpenMod2(),
                        setItemToRemove(item.name),
                        setItemQuantity(item.quantity)
                      }}
                      >Remove Item</Button>
                      <Modal
                        open={openMod2}
                        onClose={handleCloseMod2}
                        aria-labelledby="modal-modal-2"
                        aria-describedby="modal-modal-2"
                        sx={{
                          '& label.Mui-focused': {
                              color: '#543622', 
                            },
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#725444',
                            },
                            '&.Mui-focused fieldset': {
                              color: '#333',
                              borderColor: '#725444',
                            },
                          },
                        }}
                        slotProps={{
                          backdrop: { style: 
                            {
                              backgroundColor: 'rgba(0,0,0,0.2)',
                            } 
                          } 
                        }}
                      >
                        <Box sx={style}>
                          <Typography id="modal-modal-2" variant="h6" component="h2">
                            Remove Item
                          </Typography>
                          <Stack width="100%" direction={"row"} spacing={2}>
                            <TextField
                            required
                            error={quantityToRemove > itemQuantity}
                            helperText={quantityToRemove > itemQuantity ? "Invalid Quantity." : ""}
                            fullWidth
                            id="outlined-number"
                            label="Quantity"
                            type="number"
                            value={quantityToRemove}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            InputProps={{
                              inputProps: { min: 1, max: itemQuantity },
                            }}
                            onChange={(e) => setQuantityToRemove(e.target.value)}/>
    
                            <Button
                              variant="contained"
                              onClick={() => {
                                removeItem(itemToRemove, quantityToRemove), 
                                setItemToRemove(''),
                                handleCloseMod2()
                              }}
                              sx={{
                                color: "white",
                                bgcolor: "#725444",
                                '&:hover': {
                                  bgcolor: "#543622",
                                },
                              }} 
                            >Remove</Button>
                          </Stack>
                        </Box>
                      </Modal>
                    </StyledTableCell> :
                    <StyledTableCell key={column.id} align={column.align}>
                      <Typography
                        variant={'h5'}
                        color={"#333"} 
                        textAlign={"center"}
                      >
                      {column.format && typeof value === 'number' ? 
                        column.format(value) : 
                        value.toString().charAt(0).toUpperCase() + value.toString().slice(1)
                      }
                      </Typography>
                    </StyledTableCell>
                  );
                })}
              </StyledTableRow>
            );
          })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={pantry.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      /> 
      </Paper>
      </Box>
    
    </Box>
  </Box>
  )
}
