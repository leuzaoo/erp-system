import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Add Product</h1>

      <form action={createProduct} className="space-y-4">
        <Field label="Name">
          <input name="name" required className={inputCls} />
        </Field>

        <Field label="Price (BRL)">
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Max length (cm)">
            <input
              name="max_length_cm"
              type="number"
              step="0.01"
              min="0"
              className={inputCls}
            />
          </Field>
          <Field label="Max width (cm)">
            <input
              name="max_width_cm"
              type="number"
              step="0.01"
              min="0"
              className={inputCls}
            />
          </Field>
          <Field label="Max height (cm)">
            <input
              name="max_height_cm"
              type="number"
              step="0.01"
              min="0"
              className={inputCls}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked
            className="accent-neutral-200"
          />
          Active
        </label>

        <div className="flex gap-2">
          <button
            className="rounded-md bg-neutral-100 px-3 py-2 text-neutral-900 hover:bg-white"
            type="submit"
          >
            Save
          </button>
          <a
            href="/products"
            className="rounded-md border border-neutral-700 px-3 py-2 hover:bg-neutral-800"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-neutral-400">{label}</div>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600";
