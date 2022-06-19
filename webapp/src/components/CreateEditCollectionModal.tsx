import { UploadIcon } from "@heroicons/react/outline";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeTicketContract } from "../hooks/useContract";
import { useGlobalLoading } from "../hooks/useLoading";
import { Modal, ModalProps } from "./Modal";
import { TezosAmountInput } from "./TezosAmountInput";
import { SingleDatePicker } from "react-dates";
import "../styles/datepicker.css"

import coverImagePlaceholderSrc from "../assets/images/cover-image-placeholder.png";
import moment from "moment";

export const CreateEditCollectionModal: FC<
  Pick<ModalProps, "open" | "setOpen">
> = ({ open, setOpen }) => {
  const [date, setDate] = useState<any>();
  const [time, setTime] = useState<any>('12:00');
  const [ampm, setAmpm] = useState<any>('AM');
  const [totalSupply, setTotalSupply] = useState('1000');
  const [dateFocused, setDateFocused] = useState(false);
  const [imageBase64 /*setImageBase64*/] = useState<string | null>(null);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const { setLoading } = useGlobalLoading();
  const contract = useDeTicketContract();

  const getDatetimeUnixTime = async () => {
    const formattedDate = date.format('YYYY-MM-DD')
    const formattedTime = `${time} ${ampm}`
    const formattedDatetime = `${formattedDate} ${formattedTime}`
    return moment(formattedDatetime).unix
  }

  const onSubmit = async () => {
    setLoading(true);
    try {
      if (!contract) {
        return;
      }
      // Create or Edit here
      const amountNumber = Math.round(parseFloat(amount) * 10 ** 6);
      const res = await contract?.methods
        .create_ticket_collection(name, amountNumber)
        .send();
      await res.confirmation(1);
      const s = await contract?.storage<{
        ticket_collections: any;
        last_ticket_collection_id: any;
      }>();
      const lastTicketNumber = s.last_ticket_collection_id.toNumber();
      // TODO: Use a better approach to get the created collection id
      const collectionId = lastTicketNumber - 1;
      navigate(`/collections/${collectionId}`);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  const formIsValid = name !== '' && date && amount
  return (
    <Modal open={open} setOpen={setOpen}>
      <form className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Create Collection
              </h3>
            </div>

            <div className="mt-6">
              <div className="sm:col-span-4">
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    className=" focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Image
                </label>
                <img
                  alt="CoverImage"
                  src={imageBase64 || coverImagePlaceholderSrc}
                  className="w-full"
                />
                <label
                  htmlFor="image-upload"
                  className="mt-2 cursor-pointer items-center inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  <span>Upload a image</span>
                  <input
                    id="image-upload"
                    type="file"
                    className="sr-only"
                    onChange={() => {}}
                  />
                </label>
                <div className="py-1 pt-2 text-xs text-gray-500">
                  png, jpeg and webp up to 1mb
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <SingleDatePicker
                    date={date}
                    onDateChange={setDate}
                    focused={dateFocused}
                    onFocusChange={({ focused }) => setDateFocused(focused)}
                    openDirection="up"
                    anchorDirection="left"
                    id="datepicker"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Time
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(hour => {
                        const paddedHour = hour.toString().padStart(2, "0");
                        const paddedHourZero = paddedHour + ':00'
                        const paddedHourAndAHalf = paddedHour + ':30'
                        return (
                          <>
                          <option value={paddedHourZero}>{paddedHourZero}</option>
                          <option value={paddedHourAndAHalf}>{paddedHourAndAHalf}</option>
                          </>
                        )
                      })}
                    </select>
                    <select
                      value={ampm}
                      onChange={(e) => setAmpm(e.target.value)}
                      className="ml-1 max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="PM">PM</option>
                      <option value="AM">AM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <label
                    htmlFor="about"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tezos Amount
                  </label>
                  <div className="mt-1">
                    <TezosAmountInput
                      value={amount}
                      onChange={(e: any) => setAmount(e.target.value)}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">per ticket unit</p>
                </div>
                <div>
                  <label
                    htmlFor="about"
                    className="block text-sm font-medium text-gray-700"
                  >
                   Total (Max Supply)
                  </label>
                  <div className="mt-1">
                  <input
                    type="number"
                    onChange={(e) => setTotalSupply(e.target.value)}
                    value={totalSupply}
                    className=" focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                  />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">total tickets</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!formIsValid}
              onClick={() => onSubmit()}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-200"
            >
              Create
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
