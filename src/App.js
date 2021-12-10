import { useState } from "react";
import { Navbar, NavbarBrand, Container } from "react-bootstrap";
import { FormControl, InputLabel, FilledInput, FormHelperText, Typography, Grid, Button, Alert } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { isEqual } from "lodash";

const App = () => {

	//controlled input for the app
	const [input, setInput] = useState({
		A: "",
		B: "",
		value: ""
	});

	//warning for the app
	const [warning, setWarning] = useState({
		state: false,
		value: ""
	});

	//all the transactions that happened
	const [list, setList] = useState([]);

	//all the minimal transactions thats required
	const [out, setOut] = useState([]);

	function insertInput(e, key) {
		e.preventDefault();
		if ((key !== "value") && (!(/^[a-z]*$/).test(e.target.value))) {
			setWarning({
				state: true,
				value: "Only lowercase letters are allowed."
			})
			return false;
		}
		if ((key === "value") && (!(/^[0-9]*$/).test(e.target.value))) {
			setWarning({
				state: true,
				value: "Only numbers are allowed."
			})
			return false;
		}
		setInput({
			...input,
			[key]: e.target.value
		});
		return true;
	}

	function addToList(e) {
		e.preventDefault();
		setWarning({
			state: false,
			value: ""
		})
		setOut([]);
		let flag = true;
		if ((input.A !== input.B) && (Number(input.value) > 0) && (input.A !== "") && (input.B !== "")) {
			for (let i = 0; i < list.length; i++) {
				if (isEqual(list[i], input)) {
					setWarning({
						state: true,
						value: "There is simliar record available in the Transcation List."
					})
					flag = false;
					break;
				}
				if ((list[i].A === input.A) && (list[i].B === input.B)) {
					list[i].value = Number(list[i].value) + Number(input.value);
					flag = false;
					break;
				}
			}
			if (flag) {
				setList([
					...list, {
						A: input.A,
						B: input.B,
						value: Number(input.value)
					}
				]);
			}
			setInput({
				A: "",
				B: "",
				value: ""
			});
		} else {
			if (input.A === "") {
				setWarning({
					state: true,
					value: "First field is required."
				})
			} else if (input.B === "") {
				setWarning({
					state: true,
					value: "Second field is required."
				})
			} else if (input.value === "") {
				setWarning({
					state: true,
					value: "Third field is required."
				})
			} else if (input.A === input.B) {
				setWarning({
					state: true,
					value: "Both the name shouldn't be similiar."
				})
			}
		}
	}

	function removeFromList(e, indexofItem) {
		e.preventDefault();
		if (list.length > 0) {
			setList(
				list.filter((value, index) => {
					return (indexofItem !== index);
				})
			);
		}
	}

	function checkBalance(arr) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] !== 0) {
				return true;
			}
		}
		return false;
	}

	function create_S_Matrix(e) {
		e.preventDefault();

		if (list.length !== 0) {
			//create an array of all the distinct users
			let users = [];
			list.forEach(element => {
				users.push(element.A);
				users.push(element.B);
			});
			users = users.filter((value, index) => {
				return (users.indexOf(value) === index);
			});
			console.log("users: ", users);

			//create a Transcation matrix for all the distinct users
			let T = [];
			for (let i = 0; i < users.length; i++) {
				T[i] = [];
				for (let j = 0; j < users.length; j++) {
					T[i][j] = 0;
				}
			}

			//T[i][j] holds the money i owes to j
			for (let i = 0; i < list.length; i++) {
				let A = users.indexOf(list[i].A);
				let B = users.indexOf(list[i].B);
				T[A][B] = Number(list[i].value);
			}
			console.log("Transaction Matrix: ", T);

			//sum of all the value in given row(its total amount of money i owes)
			//sum of all the value in given column(its total amount of money i has lent)
			//find the net amount one owes in the group
			//positive value shows that user has lent money to the group
			//negative value shows that user owes money to the group
			let balance = [];
			for (let i = 0; i < users.length; i++) {
				let owes = 0;
				let lent = 0;
				for (let j = 0; j < users.length; j++) {
					owes = owes + Number(T[i].slice(j, j + 1));
					lent = lent + Number(T[j].slice(i, i + 1));
				}
				balance[i] = lent - owes;
			}
			console.log("balance", balance);

			if (!checkBalance(balance)) {
				setWarning({
					state: true,
					value: "The transction is already in balanced state."
				})
			} else {
				//final list of transactions
				let output = [];

				while (checkBalance(balance)) {

					//find the person who owes the most
					let MaxOwes = -1;
					//find the person who lent the most
					let MaxLent = -1;
					for (let i = 0; i < users.length; i++) {
						if (MaxOwes > -1) {
							if (balance[MaxOwes] > balance[i]) {
								MaxOwes = i;
							}
						} else {
							if (balance[MaxOwes] !== 0) {
								MaxOwes = i;
							}
						}
						if (MaxLent > -1) {
							if (balance[MaxLent] < balance[i]) {
								MaxLent = i;
							}
						} else {
							if (balance[MaxLent] !== 0) {
								MaxLent = i;
							}
						}
					}

					//insert according transaction in S matrix
					if (Math.abs(balance[MaxOwes]) > Math.abs(balance[MaxLent])) {
						output = [
							...output, {
								A: users[MaxOwes],
								B: users[MaxLent],
								value: Math.abs(balance[MaxLent])
							}
						];
						balance[MaxOwes] = -(Math.abs(balance[MaxOwes]) - Math.abs(balance[MaxLent]));
						balance[MaxLent] = 0;
					} else if (Math.abs(balance[MaxOwes]) < Math.abs(balance[MaxLent])) {
						output = [
							...output, {
								A: users[MaxOwes],
								B: users[MaxLent],
								value: Math.abs(balance[MaxOwes])
							}
						];
						balance[MaxLent] = Math.abs(balance[MaxLent]) - Math.abs(balance[MaxOwes]);
						balance[MaxOwes] = 0;
					} else if (Math.abs(balance[MaxOwes]) === Math.abs(balance[MaxLent])) {
						output = [
							...output, {
								A: users[MaxOwes],
								B: users[MaxLent],
								value: Math.abs(balance[MaxOwes])
							}
						];
						balance[MaxLent] = 0;
						balance[MaxOwes] = 0;
					}

					console.log("Balance", balance);
				}
				setOut(output);
			}
		} else {
			setOut([]);
			setWarning({
				state: true,
				value: "Please Add transactions into the List."
			})
		}
	}

	return (
		<>
			{/* Navbar for the app */}
			<Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" sticky="top">
				<Container>
					<NavbarBrand>
						GroupBills
					</NavbarBrand>
				</Container>
			</Navbar>

			{/* Input part */}
			<Container>
				<Grid container spacing={1}>
					<Grid item xs={12}>
						<Typography component="h4" variant="h4">
							Input:
						</Typography>
					</Grid>
					<Grid item xs={12} md={4}>
						<FormControl
							variant="filled"
							fullWidth
						>
							<InputLabel htmlFor="personA">Person-A</InputLabel>
							<FilledInput
								id="personA"
								name="personA"
								label="personA"
								type="text"
								value={input.A}
								onChange={(e) => insertInput(e, "A")}
								aria-describedby="my-helper-text-personA"
							/>
							<FormHelperText id="my-helper-text-input">owed_by</FormHelperText>
						</FormControl>
					</Grid>
					<Grid item xs={12} md={4}>
						<FormControl
							variant="filled"
							fullWidth
						>
							<InputLabel htmlFor="personB">Person-B</InputLabel>
							<FilledInput
								id="personB"
								name="personB"
								label="personB"
								type="text"
								value={input.B}
								onChange={(e) => insertInput(e, "B")}
								aria-describedby="my-helper-text-personB"
							/>
							<FormHelperText id="my-helper-text-personB">owed_to</FormHelperText>
						</FormControl>
					</Grid>
					<Grid item xs={12} md={4}>
						<FormControl
							variant="filled"
							fullWidth
						>
							<InputLabel htmlFor="money">Money</InputLabel>
							<FilledInput
								id="money"
								name="money"
								label="money"
								type="text"
								value={input.value}
								onChange={(e) => insertInput(e, "value")}
								aria-describedby="my-helper-text-money"
							/>
							<FormHelperText id="my-helper-text-money">Money_owed</FormHelperText>
						</FormControl>
					</Grid>
					<Grid item xs={12}>
						<Button
							variant="outlined"
							fullWidth
							onClick={(e) => addToList(e)}
						>
							<SendIcon />
						</Button>
					</Grid>
					{
						(warning.state === true)
						&&
						<Grid item xs={12}>
							<Alert severity="error">
								{warning.value}
							</Alert>
						</Grid>
					}
				</Grid>
			</Container>

			{/* our list of users */}
			<Container>
				<Grid container spacing={0.5}>
					<Grid item xs={12}>
						<Typography component="h4" variant="h4">
							List:
						</Typography>
					</Grid>
					{
						list.map((item, index) => {
							return (
								<Grid item key={index} xs={12}>
									<Alert severity="info" onClose={(e) => removeFromList(e, index)}>
										{`${item.A} owes ${item.B} ${item.value}.`}
									</Alert>
								</Grid>
							);
						})
					}
					<Grid item xs={12}>
						<Button
							variant="outlined"
							fullWidth
							onClick={(e) => create_S_Matrix(e)}
						>
							Generate
						</Button>
					</Grid>
				</Grid>
			</Container>

			{/* Output section */}
			<Container>
				<Grid container spacing={0.5}>
					<Grid item xs={12}>
						<Typography component="h4" variant="h4">
							Output:
						</Typography>
					</Grid>
					{
						out.map((item, index) => {
							return (
								<Grid item key={index} xs={12}>
									<Alert severity="success">
										{`${item.A} owes ${item.B} ${item.value}.`}
									</Alert>
								</Grid>
							);
						})
					}
				</Grid>
			</Container>

		</>
	);
}

export default App;
