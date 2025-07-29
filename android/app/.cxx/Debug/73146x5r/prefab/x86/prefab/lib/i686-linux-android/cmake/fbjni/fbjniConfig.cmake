if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "C:/Users/TECHNOVIMAL/.gradle/caches/8.13/transforms/39aa13f590b4d709b2fd3019124e2c1a/transformed/fbjni-0.7.0/prefab/modules/fbjni/libs/android.x86/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/TECHNOVIMAL/.gradle/caches/8.13/transforms/39aa13f590b4d709b2fd3019124e2c1a/transformed/fbjni-0.7.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

