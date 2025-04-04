import { useState } from "react";
import { Modal, Box, Button, TextField, Select, MenuItem, Typography } from "@mui/material";

const ActivityModal = ({ open, handleClose, addActivity }) => {
  const [activity, setActivity] = useState({
    type: "",
    category: "",
    value: "",
    unit: "",
  });

  const categories = {
    travel: ["Car", "Bus", "Bike"],
    diet: ["Meat", "Dairy", "Vegetables"],
    energy: ["Electricity", "Gas"],
  };

  const handleChange = (e) => {
    setActivity({ ...activity, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    addActivity(activity);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{ width: 400, bgcolor: "white", p: 3, mx: "auto", mt: 10, borderRadius: 2 }}>
        <Typography variant="h6">Add Activity</Typography>

        <Select fullWidth name="type" value={activity.type} onChange={handleChange}>
          <MenuItem value="travel">Travel</MenuItem>
          <MenuItem value="diet">Diet</MenuItem>
          <MenuItem value="energy">Energy</MenuItem>
        </Select>

        {activity.type && (
          <Select fullWidth name="category" value={activity.category} onChange={handleChange} sx={{ mt: 2 }}>
            {categories[activity.type]?.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        )}

        <TextField fullWidth name="value" label="Value" value={activity.value} onChange={handleChange} sx={{ mt: 2 }} />
        <TextField fullWidth name="unit" label="Unit" value={activity.unit} onChange={handleChange} sx={{ mt: 2 }} />

        <Button variant="contained" fullWidth onClick={handleSubmit} sx={{ mt: 2 }}>Submit</Button>
      </Box>
    </Modal>
  );
};

export default ActivityModal;
