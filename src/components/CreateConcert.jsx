import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import * as firebase from "firebase";
import { useSelector, useDispatch } from "react-redux";
import Select from "react-select";

const CreateConcert = () => {
  const auth = useSelector((state) => state.auth);
  const { register, handleSubmit, control } = useForm();
  const dispatch = useDispatch();
  const store = firebase.firestore();
  const [merchandise, setMerchandise] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(null);

  const onSubmit = (data) => {
    Promise.all(
      selectedOptions.map((option) =>
        firebase
          .storage()
          .ref()
          .child("/merchandise/" + option.value)
          .getDownloadURL()
          .then((imageURL) => ({
            imageURL,
            reference: store.collection("merchandise").doc(option.value),
            name: option.label,
            price: option.price,
          }))
      )
    ).then((merchandiseArray) =>
      firebase
        .firestore()
        .collection("concerts")
        .add({
          description: data.description,
          name: data.name,
          price: parseInt(data.price),
          stock: parseInt(data.stock),
          vendor: {
            name: auth.profile.name,
            reference: firebase
              .firestore()
              .collection("vendors")
              .doc(auth.user.uid),
          },
          merchandise: merchandiseArray,
          artistName: data.artistName,
          saleEnd: data.saleEnd,
          saleStart: data.saleStart,
          start: data.start,
          end: data.end,
          imageUrl: data.imageUrl,
        })
    );
  };

  let items = [];

  useEffect(() => {
    store
      .collection("merchandises")
      .where(
        "vendor",
        "==",
        store.collection("vendors").doc(auth.user && auth.user.uid)
      )
      .get()
      .then(function (querySnapshot) {
        querySnapshot.docs.forEach((doc) => {
          const { vendor, ...rest } = doc.data();
          let newObject = { ...rest, id: doc.id };
          items.push(newObject);
        });
        setMerchandise(items);
      });
  }, [auth.user, dispatch, items, store]);

  const handleMerchandise = (merchandise) => {
    let temp = [];
    merchandise.forEach((value) => {
      const { id, name } = value;
      let newObject = { value: id, label: name, price: value.price };
      temp.push(newObject);
    });
    return temp;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-neutral-black-1">
      <div className="flex flex-col px-4">
        <h1 className="text-center text-2xl">Create Concert</h1>
        <label className="text-white">Name</label>
        <input
          name="name"
          ref={register}
          className="mb-2 bg-neutral-black-1 text-white border-b border-gray-200 p-2"
        />
        <label className="text-white">Description</label>
        <input
          name="description"
          ref={register}
          className="mb-2 bg-neutral-black-1 text-white border-b border-gray-200 p-2"
        />
        <div className="flex flex-row mb-2">
          <div className="flex-1 flex flex-col">
            <label className="text-white">Concert Start</label>
            <Controller
              name="start"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <DatePicker
                  onChange={onChange}
                  onBlur={onBlur}
                  selected={value}
                  showTimeSelect
                  dateFormat="dd MMMM yyyy HH:mm"
                  placeholderText="Select concert's start date"
                  className="mb-2 bg-neutral-black-1 text-white border-b border-gray-200 p-2"
                />
              )}
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="text-white">Concert End</label>
            <Controller
              name="end"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <DatePicker
                  onChange={onChange}
                  onBlur={onBlur}
                  selected={value}
                  showTimeSelect
                  dateFormat="dd MMMM yyyy HH:mm"
                  placeholderText="Select concert's end date"
                  className="mb-2 bg-neutral-black-1 text-white border-b border-gray-200 p-2"
                />
              )}
            />
          </div>
        </div>
        <div className="flex flex-row mb-2">
          <div className="flex-1 flex flex-col">
            <label className="text-white">Sale Start</label>
            <Controller
              name="saleStart"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <DatePicker
                  onChange={onChange}
                  onBlur={onBlur}
                  selected={value}
                  showTimeSelect
                  dateFormat="dd MMMM yyyy HH:mm"
                  placeholderText="Select sale's start date"
                  className="mb-2 bg-neutral-black-1 text-white border-b border-gray-200 p-2"
                />
              )}
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="text-white">Sale End</label>
            <Controller
              name="saleEnd"
              control={control}
              render={({ onChange, onBlur, value }) => (
                <DatePicker
                  onChange={onChange}
                  onBlur={onBlur}
                  selected={value}
                  showTimeSelect
                  dateFormat="dd MMMM yyyy HH:mm"
                  placeholderText="Select sale's end date"
                  className="mb-2 bg-neutral-black-1 text-white border-b border-gray-200 p-2"
                />
              )}
            />
          </div>
        </div>
        <label className="text-white">Price</label>
        <input
          min="0"
          type="number"
          name="price"
          ref={register}
          className="mb-2 bg-neutral-black-1 text-white border-b border-gray-200 p-2"
        ></input>
        <label className="text-white">Stock</label>
        <input
          min="0"
          type="number"
          name="stock"
          ref={register}
          className="mb-2 bg-neutral-black-1 text-white border-b border-gray-200 p-2"
        ></input>
        <label className="text-white">Artist Name</label>
        <input
          name="artistName"
          ref={register}
          className="mb-2 bg-neutral-black-1 text-white border-b border-gray-200 p-2"
        ></input>
        <label className="text-white">Image URL</label>
        <input
          name="imageUrl"
          ref={register}
          className="mb-2 bg-neutral-black-1 text-white border-b border-gray-200 p-2"
        ></input>
        <label className="text-white">Merchandises</label>
        <Select
          defaultValue={selectedOptions}
          onChange={setSelectedOptions}
          isMulti
          options={merchandise.length > 0 ? handleMerchandise(merchandise) : []}
        />
        <div className="mt-8">
          <input
            type="submit"
            value="Add Concert"
            className="px-4 py-2 bg-primary-2 text-white "
          ></input>
        </div>
      </div>
    </form>
  );
};

export default CreateConcert;
