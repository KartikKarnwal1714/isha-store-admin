export default function VariantEditor({

  isOpen,

  onClose,

  product,

  updateVariantStock,

  deleteImage,

  addColor,

  deleteColor,

  addSize,

  deleteSize,

}) {

  if (!isOpen || !product)
    return null;

  return (

    <div className="fixed inset-0 bg-black/50 flex justify-center items-start overflow-auto z-50 p-2 sm:p-6 md:p-10">

      <div className="bg-white w-full max-w-6xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">

        {/* HEADER */}

        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 sm:mb-8">

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">

            Variant Editor

          </h1>

          <button
            onClick={onClose}
            className="bg-red-500 text-white px-5 py-3 rounded-xl"
          >

            Close

          </button>

        </div>

        {/* ADD COLOR */}

        <div className="flex justify-end mb-6">

          <button
            onClick={() =>
              addColor(product._id)
            }
            className="bg-black text-white px-5 py-3 rounded-xl"
          >

            + Add Color

          </button>

        </div>

        {/* COLORS */}

        {product.colors?.map(
          (
            color,
            colorIndex
          ) => (

            <div
              key={colorIndex}
              className="border rounded-2xl p-3 sm:p-6 mb-6 sm:mb-10"
            >

              {/* HEADER */}

              <div className="flex flex-wrap justify-between items-center gap-3 mb-5">

                <div className="flex items-center gap-4 min-w-0">

                  <div
                    className="w-10 h-10 rounded-full border shrink-0"
                    style={{
                      background:
                        color.colorCode,
                    }}
                  />

                  <h2 className="text-xl sm:text-2xl font-bold truncate">

                    {color.colorName}

                  </h2>

                </div>

                <button
                  onClick={() =>
                    deleteColor(
                      product._id,
                      colorIndex
                    )
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded-lg shrink-0"
                >

                  Delete Color

                </button>

              </div>

              {/* IMAGES */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

                {color.images?.map(
                  (
                    image,
                    imageIndex
                  ) => (

                    <div
                      key={imageIndex}
                      className="relative"
                    >

                      <img
                        src={image}
                        alt=""
                        className="w-full h-48 object-cover rounded-xl"
                      />

                      <button
                        onClick={() =>
                          deleteImage(
                            product._id,
                            colorIndex,
                            imageIndex
                          )
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg"
                      >

                        X

                      </button>

                    </div>
                  )
                )}

              </div>

              {/* SIZES */}

              <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border">

                <thead className="bg-gray-200">

                  <tr>

                    <th className="p-3">
                      Size
                    </th>

                    <th className="p-3">
                      Stock
                    </th>

                    <th className="p-3">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {color.sizes?.map(
                    (
                      size,
                      sizeIndex
                    ) => (

                      <tr
                        key={sizeIndex}
                        className="border-t"
                      >

                        <td className="p-3 text-center font-bold">

                          {size.size}

                        </td>

                        <td className="p-3 text-center">

                          <input
                            type="number"
                            defaultValue={
                              size.stock
                            }
                            onBlur={(e) =>
                              updateVariantStock(
                                product._id,
                                colorIndex,
                                sizeIndex,
                                Number(
                                  e.target
                                    .value
                                )
                              )
                            }
                            className="border p-2 rounded-lg w-24"
                          />

                        </td>

                        <td className="p-3 text-center">

                          <button
                            onClick={() =>
                              deleteSize(
                                product._id,
                                colorIndex,
                                sizeIndex
                              )
                            }
                            className="bg-red-500 text-white px-4 py-2 rounded-lg"
                          >

                            Delete

                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>
              </div>

              {/* ADD SIZE */}

              <div className="mt-5">

                <button
                  onClick={() =>
                    addSize(
                      product._id,
                      colorIndex
                    )
                  }
                  className="bg-blue-500 text-white px-5 py-3 rounded-xl"
                >

                  + Add Size

                </button>

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}