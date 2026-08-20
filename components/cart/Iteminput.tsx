import { products } from "@/lib/data/products";

type ItemInputProps = {
  input: string;
  setInput: (value: string) => void;
  addItem: (productName?: string) => void;
};

export default function ItemInput({
  input,
  setInput,
  addItem,
}: ItemInputProps) {
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(input.toLowerCase())
  );
  return (
    <div className="relative mb-6">

      <div className="flex gap-2">
        <input
          className="border rounded-lg px-4 py-2 flex-1 bg-white text-black placeholder:text-gray-400"
          type="text"
          placeholder="Search groceries..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={() => addItem()}
          className="bg-blue-600 text-white px-5 rounded-lg hover:bg-blue-700"
        >
          Add
        </button>
      </div>


      {input && filteredProducts.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow">

          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                addItem(product.name);
                setInput("");
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100"
            >
              <p className="font-semibold text-[#191F24]">
                {product.name}
              </p>

              <p className="text-sm text-[#3B4954]">
                {product.category}
              </p>
            </button>
          ))}

        </div>
      )}

    </div>
  );
}